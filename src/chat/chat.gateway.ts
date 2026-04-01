import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AiService, ChatContext } from './ai/ai.service';
import { SendMessageDto, TypingDto } from './dto/send-message.dto';
import { config } from 'src/config';
import { IReqUser } from 'src/base.entity';
import { MessageType } from './entities/message.entity';

@WebSocketGateway({ cors: { origin: '*', credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  // tracks userId -> set of socketIds (for multi-tab presence)
  private readonly onlineUsers = new Map<string, Set<string>>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly aiService: AiService,
  ) {}

  private extractToken(client: Socket): string | null {
    const cookie = client.handshake.headers?.cookie ?? '';
    const match = cookie
      .split(';')
      .find((c) => c.trim().startsWith('access_token='));
    if (match) return match.split('=')[1];

    return null;
  }

  private async authenticate(client: Socket): Promise<IReqUser | null> {
    const token = this.extractToken(client);
    if (!token) return null;

    try {
      return await this.jwtService.verifyAsync<IReqUser>(token, {
        secret: config.JWT_SECRET,
      });
    } catch {
      return null;
    }
  }

  async handleConnection(client: Socket) {
    const user = await this.authenticate(client);

    if (!user) {
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect();
      return;
    }

    client.data.user = user;

    // Track presence (support multiple tabs / devices)
    const sockets = this.onlineUsers.get(user.id) ?? new Set<string>();
    sockets.add(client.id);
    this.onlineUsers.set(user.id, sockets);

    // Auto-join all rooms the user already belongs to
    const rooms = await this.chatService.getUserRooms(user.id);
    for (const room of rooms) {
      if (room.id) void client.join(room.id);
    }

    // Broadcast online status
    this.server.emit('presence:update', { userId: user.id, status: 'online' });

    this.logger.log(
      `Connected: socket=${client.id} user=${user.id} (${user.first_name} ${user.last_name})`,
    );
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user as IReqUser | undefined;
    if (!user) return;

    const sockets = this.onlineUsers.get(user.id);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.onlineUsers.delete(user.id);
        this.server.emit('presence:update', {
          userId: user.id,
          status: 'offline',
        });
      }
    }

    this.logger.log(`Disconnected: socket=${client.id} user=${user.id}`);
  }

  @SubscribeMessage('rooms:join')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string },
  ) {
    const user = client.data.user as IReqUser;
    try {
      const room = await this.chatService.joinPublicRoom(data.room_id, user.id);
      if (room.id) void client.join(room.id);

      client.to(room.id!).emit('rooms:user_joined', {
        roomId: room.id,
        userId: user.id,
        userName: `${user.first_name} ${user.last_name}`,
      });

      return { event: 'rooms:joined', data: room };
    } catch (err: any) {
      return { event: 'error', data: { message: err.message } };
    }
  }

  @SubscribeMessage('rooms:leave')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string },
  ) {
    const user = client.data.user as IReqUser;
    void client.leave(data.room_id);

    client.to(data.room_id).emit('rooms:user_left', {
      roomId: data.room_id,
      userId: user.id,
      userName: `${user.first_name} ${user.last_name}`,
    });

    return { event: 'rooms:left', data: { room_id: data.room_id } };
  }

  @SubscribeMessage('messages:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    const user = client.data.user as IReqUser;

    const isMember = await this.chatService.isRoomMember(data.room_id, user.id);
    if (!isMember) {
      return {
        event: 'error',
        data: { message: 'You are not a member of this room' },
      };
    }

    const message = await this.chatService.saveMessage(
      data.room_id,
      data.content,
      user.id,
      MessageType.USER,
    );

    const payload = {
      id: message.id,
      content: message.content,
      message_type: message.message_type,
      sender_id: user.id,
      sender_name: `${user.first_name} ${user.last_name}`,
      room_id: data.room_id,
      created_at: message.created_at,
    };

    // Broadcast to everyone in the room (including sender)
    this.server.to(data.room_id).emit('messages:new', payload);

    // Handle @ai mention
    const aiMentionMatch = data.content.match(/@ai\s+([\s\S]+)/i);
    if (aiMentionMatch) {
      void this.handleAiResponse(data.room_id, aiMentionMatch[1].trim());
    }

    return { event: 'messages:sent', data: payload };
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingDto,
  ) {
    const user = client.data.user as IReqUser;
    client.to(data.room_id).emit('typing:update', {
      userId: user.id,
      userName: `${user.first_name} ${user.last_name}`,
      room_id: data.room_id,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingDto,
  ) {
    const user = client.data.user as IReqUser;
    client.to(data.room_id).emit('typing:update', {
      userId: user.id,
      userName: `${user.first_name} ${user.last_name}`,
      room_id: data.room_id,
      isTyping: false,
    });
  }

  @SubscribeMessage('presence:get_online')
  handleGetOnlineUsers() {
    return {
      event: 'presence:online_users',
      data: Array.from(this.onlineUsers.keys()),
    };
  }

  private async handleAiResponse(roomId: string, query: string): Promise<void> {
    try {
      const recentMessages =
        await this.chatService.getRecentRoomContext(roomId);

      const context: ChatContext[] = recentMessages
        .filter((msg) => msg.message_type === MessageType.USER && msg.sender)
        .map((msg) => ({
          role: 'user' as const,
          content: msg.content,
          name: msg.sender
            ? `${msg.sender.first_name}_${msg.sender.last_name}`
            : undefined,
        }));

      const aiResponse = await this.aiService.generateResponse(query, context);

      const aiMessage = await this.chatService.saveMessage(
        roomId,
        aiResponse,
        null,
        MessageType.AI,
      );

      this.server.to(roomId).emit('messages:new', {
        id: aiMessage.id,
        content: aiMessage.content,
        message_type: aiMessage.message_type,
        sender_id: null,
        sender_name: 'Echo AI',
        room_id: roomId,
        created_at: aiMessage.created_at,
      });
    } catch (err) {
      this.logger.error('AI response error:', err);
    }
  }
}
