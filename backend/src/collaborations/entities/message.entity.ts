import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Collaboration } from './collaboration.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  VOICE = 'voice',
  SYSTEM = 'system',
}

@Entity('messages')
@Index(['createdAt'])
@Index(['isDeleted'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    enumName: 'message_type_enum',
    default: MessageType.TEXT,
  })
  messageType: MessageType;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'json', nullable: true })
  accessibilityMetadata?: {
    altText?: string;
    transcript?: string;
    isScreenReaderOptimized: boolean;
  };

  @Column({ type: 'json', default: '[]' })
  attachments: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn()
  sender: User;

  @ManyToOne(() => Collaboration, (collaboration) => collaboration.messages)
  @JoinColumn()
  collaboration: Collaboration;
}