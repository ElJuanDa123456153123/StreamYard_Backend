import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Stream, StreamStatus, StreamPrivacy } from '../entities/stream.entity';
import { StreamRepository } from '../repositories/stream.repository';
import { CreateStreamDto } from '../dto/create-stream.dto';
import { UpdateStreamDto } from '../dto/update-stream.dto';
import { StreamResponseDto, StreamListDto, StreamStatsDto } from '../dto/stream-response.dto';

@Injectable()
export class StreamService {
  constructor(private readonly streamRepository: StreamRepository) {}

  async create(createStreamDto: CreateStreamDto, ownerId: string): Promise<StreamResponseDto> {
    // Apply default settings
    const streamSettings = {
      enableChat: true,
      enableRecording: true,
      enableScreenShare: true,
      autoStart: false,
      ...createStreamDto.streamSettings,
    };

    const stream = await this.streamRepository.create(
      {
        ...createStreamDto,
        streamSettings,
      },
      ownerId,
    );

    return this.toResponseDto(stream);
  }

  async findAll(userId?: string): Promise<StreamListDto[]> {
    const streams = await this.streamRepository.findAll();
    return streams.map((stream) => this.toListDto(stream));
  }

  async findById(id: string, userId?: string): Promise<StreamResponseDto> {
    const stream = await this.streamRepository.findById(id);
    if (!stream) {
      throw new NotFoundException(`Stream with ID ${id} not found`);
    }

    // Check privacy for non-owners
    if (stream.ownerId !== userId && stream.privacy === StreamPrivacy.PRIVATE) {
      throw new ForbiddenException('You do not have permission to view this stream');
    }

    return this.toResponseDto(stream);
  }

  async findByOwner(ownerId: string, requestUserId: string): Promise<StreamListDto[]> {
    if (ownerId !== requestUserId) {
      throw new ForbiddenException('You can only view your own streams');
    }

    const streams = await this.streamRepository.findByOwner(ownerId);
    return streams.map((stream) => this.toListDto(stream));
  }

  async findPublicStreams(limit?: number): Promise<StreamListDto[]> {
    const streams = await this.streamRepository.findPublicStreams(limit);
    return streams.map((stream) => this.toListDto(stream));
  }

  async findLiveStreams(): Promise<StreamListDto[]> {
    const streams = await this.streamRepository.findLiveStreams();
    return streams.map((stream) => this.toListDto(stream));
  }

  async findScheduledStreams(): Promise<StreamListDto[]> {
    const streams = await this.streamRepository.findScheduledStreams();
    return streams.map((stream) => this.toListDto(stream));
  }

  async update(
    id: string,
    updateStreamDto: UpdateStreamDto,
    userId: string,
  ): Promise<StreamResponseDto> {
    const stream = await this.streamRepository.findById(id);
    if (!stream) {
      throw new NotFoundException(`Stream with ID ${id} not found`);
    }

    // Check ownership
    if (stream.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own streams');
    }

    // Prevent updating certain fields when stream is live
    if (stream.status === StreamStatus.LIVE && updateStreamDto.platform) {
      throw new BadRequestException('Cannot change platform while stream is live');
    }

    const updatedStream = await this.streamRepository.update(id, updateStreamDto);
    return this.toResponseDto(updatedStream);
  }

  async updateStatus(
    id: string,
    status: StreamStatus,
    userId: string,
  ): Promise<StreamResponseDto> {
    const stream = await this.streamRepository.findById(id);
    if (!stream) {
      throw new NotFoundException(`Stream with ID ${id} not found`);
    }

    // Check ownership
    if (stream.ownerId !== userId) {
      throw new ForbiddenException('You can only modify your own streams');
    }

    // Validate status transitions
    if (stream.status === StreamStatus.ENDED) {
      throw new BadRequestException('Cannot modify an ended stream');
    }

    if (status === StreamStatus.LIVE && stream.status !== StreamStatus.SCHEDULED) {
      // Update timestamps for starting a stream
      const updateDto: UpdateStreamDto = {
        status: StreamStatus.LIVE,
        startedAt: new Date().toISOString() as any,
      };
      const updatedStream = await this.streamRepository.update(id, updateDto);
      return this.toResponseDto(updatedStream);
    }

    if (status === StreamStatus.ENDED && stream.status === StreamStatus.LIVE) {
      // Update timestamps for ending a stream
      const updateDto: UpdateStreamDto = {
        status: StreamStatus.ENDED,
        endedAt: new Date().toISOString() as any,
      };
      const updatedStream = await this.streamRepository.update(id, updateDto);
      return this.toResponseDto(updatedStream);
    }

    const updatedStream = await this.streamRepository.updateStatus(id, status);
    return this.toResponseDto(updatedStream);
  }

  async incrementViewerCount(id: string): Promise<void> {
    await this.streamRepository.incrementViewerCount(id);
  }

  async decrementViewerCount(id: string): Promise<void> {
    await this.streamRepository.decrementViewerCount(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const stream = await this.streamRepository.findById(id);
    if (!stream) {
      throw new NotFoundException(`Stream with ID ${id} not found`);
    }

    // Check ownership
    if (stream.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own streams');
    }

    // Cannot delete a live stream
    if (stream.status === StreamStatus.LIVE) {
      throw new BadRequestException('Cannot delete a live stream. End it first.');
    }

    await this.streamRepository.remove(id);
  }

  async getStats(): Promise<StreamStatsDto> {
    const stats = await this.streamRepository.getStreamStats();

    return {
      totalStreams: stats.total,
      activeStreams: stats.live,
      totalViewers: 0, // This would require aggregating viewer counts
      averageDuration: 0, // This would require calculating average durations
    };
  }

  private toResponseDto(stream: Stream): StreamResponseDto {
    return {
      id: stream.id,
      title: stream.title,
      description: stream.description,
      privacy: stream.privacy,
      status: stream.status,
      platform: stream.platform || [],
      thumbnailUrl: stream.thumbnailUrl,
      maxParticipants: stream.maxParticipants,
      streamSettings: stream.streamSettings,
      scheduledFor: stream.scheduledFor,
      startedAt: stream.startedAt,
      endedAt: stream.endedAt,
      duration: stream.duration,
      viewerCount: stream.viewerCount,
      isRecorded: stream.isRecorded,
      recordingUrl: stream.recordingUrl,
      ownerId: stream.ownerId,
      createdAt: stream.createdAt,
      updatedAt: stream.updatedAt,
    };
  }

  private toListDto(stream: Stream): StreamListDto {
    return {
      id: stream.id,
      title: stream.title,
      description: stream.description,
      privacy: stream.privacy,
      status: stream.status,
      thumbnailUrl: stream.thumbnailUrl,
      scheduledFor: stream.scheduledFor,
      viewerCount: stream.viewerCount,
      owner: {
        id: stream.owner.id,
        name: stream.owner.name,
        avatar: stream.owner.avatar,
      },
      createdAt: stream.createdAt,
    };
  }
}
