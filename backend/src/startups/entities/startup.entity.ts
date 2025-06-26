import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Collaboration } from '../../collaborations/entities/collaboration.entity';
import { Investment } from '../../investments/entities/investment.entity';

export enum StartupStage {
  IDEA = 'idea',
  VALIDATION = 'validation',
  PROTOTYPE = 'prototype',
  MVP = 'mvp',
  EARLY_TRACTION = 'early_traction',
  GROWTH = 'growth',
  EXPANSION = 'expansion',
  MATURE = 'mature',
}

export enum StartupStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  DISCONTINUED = 'discontinued',
}

export enum FundingStatus {
  NOT_SEEKING = 'not_seeking',
  SEEKING_SEED = 'seeking_seed',
  SEEKING_SERIES_A = 'seeking_series_a',
  SEEKING_SERIES_B = 'seeking_series_b',
  SEEKING_LATER_STAGE = 'seeking_later_stage',
  FULLY_FUNDED = 'fully_funded',
}

@Entity('startups')
@Index(['name'])
@Index(['industry'])
@Index(['stage'])
@Index(['status'])
@Index(['fundingStatus'])
export class Startup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  tagline: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  logo: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column()
  industry: string;

  @Column('simple-array', { nullable: true })
  categories: string[];

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({
    type: 'enum',
    enum: StartupStage,
    default: StartupStage.IDEA,
  })
  stage: StartupStage;

  @Column({
    type: 'enum',
    enum: StartupStatus,
    default: StartupStatus.ACTIVE,
  })
  status: StartupStatus;

  @Column({
    type: 'enum',
    enum: FundingStatus,
    default: FundingStatus.NOT_SEEKING,
  })
  fundingStatus: FundingStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  fundingGoal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  currentFunding: number;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  linkedin: string;

  @Column({ nullable: true })
  twitter: string;

  @Column({ nullable: true })
  github: string;

  @Column({ nullable: true })
  location: string;

  @Column({ default: false })
  isRemote: boolean;

  @Column('simple-array', { nullable: true })
  techStack: string[];

  @Column('simple-array', { nullable: true })
  skillsNeeded: string[];

  @Column('simple-array', { nullable: true })
  rolesNeeded: string[];

  @Column({ type: 'text', nullable: true })
  problemStatement: string;

  @Column({ type: 'text', nullable: true })
  solution: string;

  @Column({ type: 'text', nullable: true })
  targetMarket: string;

  @Column({ type: 'text', nullable: true })
  businessModel: string;

  @Column({ type: 'text', nullable: true })
  competitiveAdvantage: string;

  @Column({ type: 'text', nullable: true })
  marketSize: string;

  @Column({ type: 'text', nullable: true })
  revenueModel: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  monthlyRevenue: number;

  @Column({ type: 'integer', nullable: true })
  userCount: number;

  @Column({ type: 'integer', nullable: true })
  teamSize: number;

  @Column('json', { nullable: true })
  metrics: Record<string, any>;

  @Column('json', { nullable: true })
  socialImpact: Record<string, any>;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ default: true })
  isAcceptingCollaborators: boolean;

  @Column({ default: false })
  isAcceptingInvestors: boolean;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  collaborationCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.foundedStartups, { eager: true })
  @JoinColumn({ name: 'founder_id' })
  founder: User;

  @ManyToMany(() => User, user => user.collaboratingStartups)
  collaborators: User[];

  @OneToMany(() => Collaboration, collaboration => collaboration.startup)
  collaborationRequests: Collaboration[];

  @OneToMany(() => Investment, investment => investment.startup)
  investments: Investment[];

  // Computed properties
  get fundingProgress(): number {
    if (!this.fundingGoal || this.fundingGoal === 0) return 0;
    return (this.currentFunding / this.fundingGoal) * 100;
  }

  get isFullyFunded(): boolean {
    return this.fundingStatus === FundingStatus.FULLY_FUNDED ||
           (this.fundingGoal && this.currentFunding >= this.fundingGoal);
  }

  get isEarlyStage(): boolean {
    return [StartupStage.IDEA, StartupStage.VALIDATION, StartupStage.PROTOTYPE].includes(this.stage);
  }

  get collaboratorCount(): number {
    return this.collaborators?.length || 0;
  }

  get totalInvestment(): number {
    return this.investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
  }
}