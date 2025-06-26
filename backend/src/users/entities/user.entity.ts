import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Startup } from '../../startups/entities/startup.entity';
import { Collaboration } from '../../collaborations/entities/collaboration.entity';
import { Investment } from '../../investments/entities/investment.entity';

export enum UserRole {
  ENTREPRENEUR = 'entrepreneur',
  COLLABORATOR = 'collaborator',
  INVESTOR = 'investor',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  linkedin: string;

  @Column({ nullable: true })
  github: string;

  @Column({ nullable: true })
  twitter: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.ENTREPRENEUR],
  })
  roles: UserRole[];

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @Column('simple-array', { nullable: true })
  skills: string[];

  @Column('simple-array', { nullable: true })
  interests: string[];

  @Column('simple-array', { nullable: true })
  languages: string[];

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true, type: 'timestamp' })
  passwordResetExpires: Date;

  @Column({ nullable: true, type: 'timestamp' })
  lastLoginAt: Date;

  @Column({ default: 0 })
  loginCount: number;

  @Column('json', { nullable: true })
  preferences: Record<string, any>;

  @Column('json', { nullable: true })
  socialProfiles: Record<string, string>;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Startup, startup => startup.founder)
  foundedStartups: Startup[];

  @ManyToMany(() => Startup, startup => startup.collaborators)
  @JoinTable({
    name: 'user_startup_collaborations',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'startup_id', referencedColumnName: 'id' },
  })
  collaboratingStartups: Startup[];

  @OneToMany(() => Collaboration, collaboration => collaboration.collaborator)
  collaborationRequests: Collaboration[];

  @OneToMany(() => Collaboration, collaboration => collaboration.startup.founder)
  receivedCollaborations: Collaboration[];

  @OneToMany(() => Investment, investment => investment.investor)
  investments: Investment[];

  // Computed properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isEntrepreneur(): boolean {
    return this.roles.includes(UserRole.ENTREPRENEUR);
  }

  get isCollaborator(): boolean {
    return this.roles.includes(UserRole.COLLABORATOR);
  }

  get isInvestor(): boolean {
    return this.roles.includes(UserRole.INVESTOR);
  }

  get isAdmin(): boolean {
    return this.roles.includes(UserRole.ADMIN);
  }
}