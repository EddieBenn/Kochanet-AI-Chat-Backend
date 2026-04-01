import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom, RoomType } from './entities/chat-room.entity';
import { Message, MessageType } from './entities/message.entity';
import { Users } from '../users/entities/user.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { IReqUser } from 'src/base.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async createRoom(data: CreateRoomDto, user: IReqUser): Promise<ChatRoom> {
    const creator = await this.usersRepository.findOne({
      where: { id: user.id },
    });

    if (!creator?.id) throw new NotFoundException('User not found');

    const room = this.chatRoomRepository.create({
      name: data.name,
      type: data.type ?? RoomType.PUBLIC,
      created_by: user.id,
      members: [creator],
    });

    return this.chatRoomRepository.save(room);
  }

  async getPublicRooms(): Promise<ChatRoom[]> {
    return this.chatRoomRepository.find({
      where: { type: RoomType.PUBLIC },
      select: ['id', 'name', 'type', 'created_by', 'created_at'],
    });
  }

  async getUserRooms(userId: string): Promise<ChatRoom[]> {
    return this.chatRoomRepository
      .createQueryBuilder('room')
      .innerJoin('room.members', 'member', 'member.id = :userId', { userId })
      .where('room.deleted_at IS NULL')
      .select([
        'room.id',
        'room.name',
        'room.type',
        'room.created_by',
        'room.created_at',
      ])
      .getMany();
  }

  async getRoomById(roomId: string): Promise<ChatRoom> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['members'],
    });
    if (!room) throw new NotFoundException('Chat room not found');
    return room;
  }

  async inviteToRoom(
    roomId: string,
    targetUserId: string,
    requesterId: string,
  ): Promise<ChatRoom> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['members'],
    });
    if (!room) throw new NotFoundException('Chat room not found');

    const isCreatorOrMember = room.members.some((m) => m.id === requesterId);
    if (!isCreatorOrMember)
      throw new ForbiddenException('You are not a member of this room');

    const alreadyMember = room.members.some((m) => m.id === targetUserId);
    if (alreadyMember) return room;

    const targetUser = await this.usersRepository.findOne({
      where: { id: targetUserId },
    });
    if (!targetUser) throw new NotFoundException('User not found');

    room.members.push(targetUser);
    return this.chatRoomRepository.save(room);
  }

  async joinPublicRoom(roomId: string, userId: string): Promise<ChatRoom> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['members'],
    });
    if (!room) throw new NotFoundException('Chat room not found');

    if (room.type === RoomType.PRIVATE)
      throw new ForbiddenException(
        'This is a private room. You need an invitation to join.',
      );

    const alreadyMember = room.members.some((m) => m.id === userId);
    if (!alreadyMember) {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });
      if (!user) throw new NotFoundException('User not found');
      room.members.push(user);
      await this.chatRoomRepository.save(room);
    }

    return room;
  }

  async saveMessage(
    roomId: string,
    content: string,
    senderId: string | null,
    messageType: MessageType,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      content,
      room_id: roomId,
      sender_id: senderId,
      message_type: messageType,
    });
    return this.messageRepository.save(message);
  }

  async getRoomMessages(
    roomId: string,
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ messages: Message[]; total: number }> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['members'],
    });
    if (!room) throw new NotFoundException('Chat room not found');

    const isMember = room.members.some((m) => m.id === userId);
    if (!isMember && room.type === RoomType.PRIVATE)
      throw new ForbiddenException('You are not a member of this room');

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { room_id: roomId },
      relations: ['sender'],
      order: { created_at: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { messages: messages.reverse(), total };
  }

  async isRoomMember(roomId: string, userId: string): Promise<boolean> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['members'],
    });
    if (!room) return false;
    return room.members.some((m) => m.id === userId);
  }

  async getRecentRoomContext(
    roomId: string,
    limit: number = 10,
  ): Promise<Message[]> {
    return this.messageRepository.find({
      where: { room_id: roomId },
      relations: ['sender'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}
