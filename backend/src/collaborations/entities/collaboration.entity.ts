import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Startup } from '../../startups/entities/startup.entity';

export enum CollaborationStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum CollaborationType {
  VOLUNTEER = 'volunteer',
  CONTRACTOR = 'contractor',
  ADVISOR = 'advisor',
  MENTOR = 'mentor',
  PARTNER = 'partner',
}

@Entity('collaborations')
export class Collaboration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CollaborationType })
  type: CollaborationType;

  @Column({ type: 'enum', enum: CollaborationStatus, default: CollaborationStatus.PENDING })
  status: CollaborationStatus;

  @Column()
  role: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  skills_required: string[];

  @Column({ type: 'int', nullable: true })
  hours_per_week: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compensation: number;

  @Column({ nullable: true })
  start_date: Date;

  @Column({ nullable: true })
  end_date: Date;

  @Column({ type: 'text', nullable: true })
  deliverables: string;

  @Column({ type: 'text', nullable: true })
  progress_notes: string;

  @ManyToOne(() => User, user => user.collaborationRequests)
  @JoinColumn({ name: 'collaborator_id' })
  collaborator: User;

  @Column()
  collaborator_id: string;

  @ManyToOne(() => Startup, startup => startup.collaborationRequests)
  @JoinColumn({ name: 'startup_id' })
  startup: Startup;

  @Column()
  startup_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}