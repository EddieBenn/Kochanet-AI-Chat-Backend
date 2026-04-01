import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @IsUUID()
  room_id: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}

export class TypingDto {
  @IsNotEmpty()
  @IsUUID()
  room_id: string;
}
