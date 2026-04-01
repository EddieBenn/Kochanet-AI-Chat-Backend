import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { RoomType } from '../entities/chat-room.entity';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(RoomType)
  type?: RoomType;
}

export class InviteToRoomDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}
