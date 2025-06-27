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

export enum InvestmentType {
  SEED = 'seed',
  SERIES_A = 'series_a',
  SERIES_B = 'series_b',
  SERIES_C = 'series_c',
  BRIDGE = 'bridge',
  CONVERTIBLE = 'convertible',
}

export enum InvestmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('investments')
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: InvestmentType })
  type: InvestmentType;

  @Column({ type: 'enum', enum: InvestmentStatus, default: InvestmentStatus.PENDING })
  status: InvestmentStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  equity_percentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  valuation: number;

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  due_diligence_completed_at: Date;

  @Column({ nullable: true })
  contract_signed_at: Date;

  @Column({ nullable: true })
  funds_transferred_at: Date;

  @ManyToOne(() => User, user => user.investments)
  @JoinColumn({ name: 'investor_id' })
  investor: User;

  @Column()
  investor_id: string;

  @ManyToOne(() => Startup, startup => startup.investments)
  @JoinColumn({ name: 'startup_id' })
  startup: Startup;

  @Column()
  startup_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}