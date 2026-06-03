import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Stream } from '../../../streams/entities/stream.entity';

export enum SessionStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  ENDED = 'ended',
  KICKED = 'kicked',
}

export enum SessionRole {
  HOST = 'host',
  GUEST = 'guest',
  PRODUCER = 'producer',
}

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.WAITING })
  status: SessionStatus;

  @Column({ type: 'enum', enum: SessionRole, default: SessionRole.GUEST })
  role: SessionRole;

  @Column({ type: 'json', nullable: true })
  metadata?: {
    browser?: string;
    os?: string;
    deviceType?: string;
    ip?: string;
    location?: {
      country?: string;
      city?: string;
    };
  };

  @Column({ type: 'timestamp with time zone', nullable: true })
  joinedAt?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  leftAt?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  duration?: Date;

  @Column({ default: false })
  isAudioEnabled: boolean;

  @Column({ default: false })
  isVideoEnabled: boolean;

  @Column({ default: false })
  isScreenSharing: boolean;

  @Column({ type: 'json', nullable: true })
  connectionQuality?: {
    bitrate?: number;
    fps?: number;
    resolution?: string;
    packetLoss?: number;
  };

  // Foreign Keys
  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  streamId: string;

  @ManyToOne(() => Stream, (stream) => stream.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'streamId' })
  stream: Stream;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
