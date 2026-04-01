import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from '../../base.entity';
import { Users } from '../../users/entities/user.entity';
import { Message } from './message.entity';

export enum RoomType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

@Entity({ name: 'chat_rooms' })
export class ChatRoom extends BaseEntity {
  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Column({
    nullable: false,
    type: 'varchar',
    enum: [RoomType.PUBLIC, RoomType.PRIVATE],
    default: RoomType.PUBLIC,
  })
  type: RoomType;

  @Column({ nullable: false, type: 'uuid' })
  created_by: string;

  @ManyToMany(() => Users, { eager: false })
  @JoinTable({
    name: 'room_members',
    joinColumn: { name: 'room_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  members: Users[];

  @OneToMany(() => Message, (message: Message) => message.room)
  messages: Message[];
}
