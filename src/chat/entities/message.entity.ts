import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../base.entity';
import { Users } from '../../users/entities/user.entity';
import { ChatRoom } from './chat-room.entity';

export enum MessageType {
  USER = 'user',
  AI = 'ai',
}

@Entity({ name: 'messages' })
export class Message extends BaseEntity {
  @Column({ nullable: false, type: 'text' })
  content: string;

  @Column({
    nullable: false,
    type: 'varchar',
    enum: [MessageType.USER, MessageType.AI],
    default: MessageType.USER,
  })
  message_type: MessageType;

  @Column({ nullable: true, type: 'uuid' })
  sender_id: string | null;

  @ManyToOne(() => Users, {
    nullable: true,
    eager: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'sender_id' })
  sender: Users;

  @Column({ nullable: false, type: 'uuid' })
  room_id: string;

  @ManyToOne(() => ChatRoom, (room: ChatRoom) => room.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'room_id' })
  room: ChatRoom;
}
