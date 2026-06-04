import { StreamPrivacy, StreamStatus, StreamPlatform } from '../entities/stream.entity';

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
  owner?: any;
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
  ownerId: string;
  createdAt: Date;
}

export class StreamStatsDto {
  totalStreams: number;
  activeStreams: number;
  totalViewers: number;
  averageDuration: number;
}
