import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ChatService } from './chat.service';
import { CreateRoomDto, InviteToRoomDto } from './dto/create-room.dto';
import { IReqUser } from 'src/base.entity';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('rooms')
  async createRoom(@Body() body: CreateRoomDto, @Req() req: Request) {
    const user = req['user'] as IReqUser;
    return this.chatService.createRoom(body, user);
  }

  @Get('rooms')
  async getMyRooms(@Req() req: Request) {
    const user = req['user'] as IReqUser;
    return this.chatService.getUserRooms(user.id);
  }

  @Get('rooms/public')
  async getPublicRooms() {
    return this.chatService.getPublicRooms();
  }

  @Get('rooms/:id')
  async getRoomById(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.getRoomById(id);
  }

  @Post('rooms/:id/invite')
  async inviteToRoom(
    @Param('id', ParseUUIDPipe) roomId: string,
    @Body() body: InviteToRoomDto,
    @Req() req: Request,
  ) {
    const user = req['user'] as IReqUser;
    return this.chatService.inviteToRoom(roomId, body.user_id, user.id);
  }

  @Get('rooms/:id/messages')
  async getRoomMessages(
    @Param('id', ParseUUIDPipe) roomId: string,
    @Query('limit') limit: string,
    @Query('offset') offset: string,
    @Req() req: Request,
  ) {
    const user = req['user'] as IReqUser;
    return this.chatService.getRoomMessages(
      roomId,
      user.id,
      limit ? Number(limit) : 50,
      offset ? Number(offset) : 0,
    );
  }
}
