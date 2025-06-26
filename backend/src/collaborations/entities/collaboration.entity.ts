import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Startup } from '../../startups/entities/startup.entity';
import { Message } from './message.entity';

export enum CollaborationRole {
  CO_FOUNDER = 'co-founder',
  TECHNICAL_LEAD = 'technical-lead',
  DESIGNER = 'designer',
  MARKETER = 'marketer',
  BUSINESS_DEVELOPER = 'business-developer',
  ADVISOR = 'advisor',
  VOLUNTEER = 'volunteer',
}

export enum CollaborationStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  TERMINATED = 'terminated',
}

@Entity('collaborations')
@Index(['status'])
@Index(['role'])
export class Collaboration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CollaborationRole,
    enumName: 'collaboration_role_enum',
  })
  role: CollaborationRole;

  @Column({
    type: 'enum',
    enum: CollaborationStatus,
    enumName: 'collaboration_status_enum',
    default: CollaborationStatus.PENDING,
  })
  status: CollaborationStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  equityPercentage?: number;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ nullable: true })
  startDate?: Date;

  @Column({ nullable: true })
  endDate?: Date;

  @Column({ type: 'json', default: '[]' })
  contributions: string[];

  @Column({ type: 'text', nullable: true })
  testimonial?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Startup, (startup) => startup.collaborations)
  @JoinColumn()
  startup: Startup;

  @ManyToOne(() => User, (user) => user.collaborations)
  @JoinColumn()
  collaborator: User;

  @OneToMany(() => Message, (message) => message.collaboration)
  messages: Message[];
}