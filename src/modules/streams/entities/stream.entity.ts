import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum StreamStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export enum StreamPrivacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
  UNLISTED = 'unlisted',
}

export enum StreamPlatform {
  YOUTUBE = 'youtube',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin',
  TWITTER = 'twitter',
  TWITCH = 'twitch',
  CUSTOM = 'custom',
}

@Entity('streams')
export class Stream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ default: StreamPrivacy.PUBLIC })
  privacy: StreamPrivacy;

  @Column({ default: StreamStatus.DRAFT })
  status: StreamStatus;

  @Column({ type: 'json', nullable: true })
  platform: StreamPlatform[];

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ default: 0 })
  maxParticipants: number;

  @Column({ type: 'json', nullable: true })
  streamSettings?: {
    enableChat: boolean;
    enableRecording: boolean;
    enableScreenShare: boolean;
    autoStart: boolean;
  };

  @Column({ type: 'timestamp with time zone', nullable: true })
  scheduledFor?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  endedAt?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  duration?: Date;

  @Column({ default: 0 })
  viewerCount: number;

  @Column({ default: false })
  isRecorded: boolean;

  @Column({ nullable: true })
  recordingUrl?: string;

  // Foreign Keys
  @Column('uuid')
  ownerId: string;

  // Relations - sin decoradores para evitar errores
  owner?: any;
  sessions?: any[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
