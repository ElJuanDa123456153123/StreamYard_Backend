import { SessionStatus, SessionRole } from '../entities/session.entity';

export class SessionResponseDto {
  id: string;
  status: SessionStatus;
  role: SessionRole;
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
  joinedAt?: Date;
  leftAt?: Date;
  duration?: Date;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality?: {
    bitrate?: number;
    fps?: number;
    resolution?: string;
    packetLoss?: number;
  };
  userId: string;
  user?: any;
  streamId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SessionListDto {
  id: string;
  status: SessionStatus;
  role: SessionRole;
  joinedAt?: Date;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}
