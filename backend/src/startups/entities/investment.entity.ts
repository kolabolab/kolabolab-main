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
import { Startup, FundingStage } from './startup.entity';

export enum InvestmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

@Entity('investments')
@Index(['status'])
@Index(['stage'])
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: FundingStage,
    enumName: 'funding_stage_enum',
  })
  stage: FundingStage;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  valuation?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  equityPercentage?: number;

  @Column({
    type: 'enum',
    enum: InvestmentStatus,
    enumName: 'investment_status_enum',
    default: InvestmentStatus.PENDING,
  })
  status: InvestmentStatus;

  @Column({ type: 'json', nullable: true })
  terms?: {
    liquidationPreference: string;
    boardSeats: number;
    antidilutionRights: boolean;
    dividendRights: boolean;
  };

  @Column({ type: 'json', default: '[]' })
  documents: string[];

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ nullable: true })
  closedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Startup, (startup) => startup.investments)
  @JoinColumn()
  startup: Startup;

  @ManyToOne(() => User, (user) => user.investments)
  @JoinColumn()
  investor: User;
}