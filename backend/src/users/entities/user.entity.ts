import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Startup } from '../../startups/entities/startup.entity';
import { Collaboration } from '../../collaborations/entities/collaboration.entity';
import { Investment } from '../../startups/entities/investment.entity';

export enum UserRole {
  ENTREPRENEUR = 'entrepreneur',
  INVESTOR = 'investor',
  COLLABORATOR = 'collaborator',
  MENTOR = 'mentor',
}

export enum FontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra-large',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['role'])
@Index(['isVerified'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum',
    default: UserRole.ENTREPRENEUR,
  })
  role: UserRole;

  @Column({ type: 'json', nullable: true })
  accessibilityPreferences?: {
    screenReaderOptimized: boolean;
    highContrastMode: boolean;
    reducedMotion: boolean;
    voiceInputEnabled: boolean;
    keyboardNavigationOnly: boolean;
    fontSize: FontSize;
  };

  @Column({ type: 'json', default: '[]' })
  skills: string[];

  @Column({ type: 'json', nullable: true })
  location?: {
    city: string;
    country: string;
    coordinates: [number, number];
  };

  @Column({ type: 'json', default: '["English"]' })
  languages: string[];

  @Column({ default: 'UTC' })
  timezone: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  onboardingCompleted: boolean;

  @Column({ default: 0 })
  reputationScore: number;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  portfolioUrl?: string;

  @Column({ nullable: true })
  linkedInUrl?: string;

  @Column({ nullable: true })
  githubUrl?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Startup, (startup) => startup.founder)
  foundedStartups: Startup[];

  @OneToMany(() => Collaboration, (collaboration) => collaboration.collaborator)
  collaborations: Collaboration[];

  @OneToMany(() => Investment, (investment) => investment.investor)
  investments: Investment[];

  // Virtual fields
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}