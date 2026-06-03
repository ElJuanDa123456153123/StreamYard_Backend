import { StreamPrivacy, StreamStatus, StreamPlatform } from '../entities/stream.entity';
import { UserResponseDto } from '../../../users/dto/user-response.dto';

export class StreamSettingsDto {
  enableChat: boolean;
  enableRecording: boolean;
  enableScreenShare: boolean;
  autoStart: boolean;
}

export class StreamResponseDto {
  id: string;
  title: string;
  description?: string;
  privacy: StreamPrivacy;
  status: StreamStatus;
  platform: StreamPlatform[];
  thumbnailUrl?: string;
  maxParticipants: number;
  streamSettings?: StreamSettingsDto;
  scheduledFor?: Date;
  startedAt?: Date;
  endedAt?: Date;
  duration?: Date;
  viewerCount: number;
  isRecorded: boolean;
  recordingUrl?: string;
  ownerId: string;
  owner?: UserResponseDto;
  createdAt: Date;
  updatedAt: Date;
}

export class StreamListDto {
  id: string;
  title: string;
  description?: string;
  privacy: StreamPrivacy;
  status: StreamStatus;
  thumbnailUrl?: string;
  scheduledFor?: Date;
  viewerCount: number;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
}

export class StreamStatsDto {
  totalStreams: number;
  activeStreams: number;
  totalViewers: number;
  averageDuration: number;
}
