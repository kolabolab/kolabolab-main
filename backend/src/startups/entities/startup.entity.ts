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
import { Collaboration } from '../../collaborations/entities/collaboration.entity';
import { Investment } from './investment.entity';

export enum FundingStage {
  IDEA = 'idea',
  PRE_SEED = 'pre-seed',
  SEED = 'seed',
  SERIES_A = 'series-a',
  SERIES_B = 'series-b',
  SERIES_C = 'series-c',
  IPO = 'ipo',
}

@Entity('startups')
@Index(['fundingStage'])
@Index(['isPublic'])
@Index(['tags'])
export class Startup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'json', default: '[]' })
  tags: string[];

  @Column({
    type: 'enum',
    enum: FundingStage,
    enumName: 'funding_stage_enum',
    default: FundingStage.IDEA,
  })
  fundingStage: FundingStage;

  @Column({ nullable: true })
  targetMarket?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  equityOffered?: number;

  @Column({ nullable: true })
  estimatedTimeline?: string;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ default: false })
  accessibilityCompliant: boolean;

  @Column({ nullable: true })
  pitchDeckUrl?: string;

  @Column({ nullable: true })
  businessPlanUrl?: string;

  @Column({ nullable: true })
  fundingGoal?: string;

  @Column({ type: 'text', nullable: true })
  businessModel?: string;

  @Column({ type: 'text', nullable: true })
  competitiveAdvantage?: string;

  @Column({ type: 'text', nullable: true })
  requiredSkills?: string;

  @Column({ default: 1 })
  teamSize: number;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.foundedStartups, { eager: true })
  @JoinColumn()
  founder: User;

  @OneToMany(() => Collaboration, (collaboration) => collaboration.startup)
  collaborations: Collaboration[];

  @OneToMany(() => Investment, (investment) => investment.startup)
  investments: Investment[];
}