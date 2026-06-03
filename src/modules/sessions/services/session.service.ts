import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Session, SessionStatus, SessionRole } from '../entities/session.entity';
import { SessionRepository } from '../repositories/session.repository';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';
import { StreamService } from '../../streams/services/stream.service';
import { SessionResponseDto, SessionListDto } from '../dto/session-response.dto';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly streamService: StreamService,
  ) {}

  async create(
    createSessionDto: CreateSessionDto,
    userId: string,
    streamId: string,
  ): Promise<SessionResponseDto> {
    // Verify stream exists and is accessible
    const stream = await this.streamService.findById(streamId, userId);

    // Check if stream can accept more participants
    if (stream.status === 'live') {
      const activeCount = await this.sessionRepository.getActiveParticipantCount(streamId);
      if (activeCount >= stream.maxParticipants) {
        throw new BadRequestException('Stream has reached maximum participants');
      }
    }

    // Check if user already has an active session
    const existingSession = await this.sessionRepository.findByUserAndStream(userId, streamId);
    if (existingSession && existingSession.status === SessionStatus.ACTIVE) {
      throw new BadRequestException('User already has an active session in this stream');
    }

    const session = await this.sessionRepository.create(createSessionDto, userId, streamId);
    return this.toResponseDto(session);
  }

  async findAll(): Promise<SessionListDto[]> {
    const sessions = await this.sessionRepository.findAll();
    return sessions.map((session) => this.toListDto(session));
  }

  async findById(id: string, userId: string): Promise<SessionResponseDto> {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    // Check if user has permission to view this session
    if (session.userId !== userId && session.stream.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to view this session');
    }

    return this.toResponseDto(session);
  }

  async findByStream(streamId: string, userId: string): Promise<SessionListDto[]> {
    // Verify stream exists and user has access
    await this.streamService.findById(streamId, userId);

    const sessions = await this.sessionRepository.findByStream(streamId);
    return sessions.map((session) => this.toListDto(session));
  }

  async findByUser(userId: string, requestUserId: string): Promise<SessionListDto[]> {
    // Users can only view their own sessions
    if (userId !== requestUserId) {
      throw new ForbiddenException('You can only view your own sessions');
    }

    const sessions = await this.sessionRepository.findByUser(userId);
    return sessions.map((session) => this.toListDto(session));
  }

  async findActiveSessions(streamId: string, userId: string): Promise<SessionListDto[]> {
    // Verify stream exists and user has access
    await this.streamService.findById(streamId, userId);

    const sessions = await this.sessionRepository.findActiveSessions(streamId);
    return sessions.map((session) => this.toListDto(session));
  }

  async update(
    id: string,
    updateSessionDto: UpdateSessionDto,
    userId: string,
  ): Promise<SessionResponseDto> {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    // Only the session owner or stream owner can update
    if (session.userId !== userId && session.stream.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this session');
    }

    const updatedSession = await this.sessionRepository.update(id, updateSessionDto);
    return this.toResponseDto(updatedSession);
  }

  async joinSession(sessionId: string, userId: string): Promise<SessionResponseDto> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('You can only join your own session');
    }

    if (session.status === SessionStatus.ACTIVE) {
      throw new BadRequestException('Session is already active');
    }

    const updatedSession = await this.sessionRepository.updateStatus(sessionId, SessionStatus.ACTIVE);
    return this.toResponseDto(updatedSession);
  }

  async leaveSession(sessionId: string, userId: string): Promise<SessionResponseDto> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('You can only leave your own session');
    }

    const updatedSession = await this.sessionRepository.updateStatus(sessionId, SessionStatus.ENDED);
    return this.toResponseDto(updatedSession);
  }

  async kickParticipant(sessionId: string, streamId: string, userId: string): Promise<SessionResponseDto> {
    // Verify user is stream owner
    const stream = await this.streamService.findById(streamId, userId);
    if (stream.ownerId !== userId) {
      throw new ForbiddenException('Only stream owner can kick participants');
    }

    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    if (session.streamId !== streamId) {
      throw new BadRequestException('Session does not belong to this stream');
    }

    const updatedSession = await this.sessionRepository.updateStatus(sessionId, SessionStatus.KICKED);
    return this.toResponseDto(updatedSession);
  }

  async remove(id: string, userId: string): Promise<void> {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    // Only the session owner can delete
    if (session.userId !== userId) {
      throw new ForbiddenException('You can only delete your own sessions');
    }

    await this.sessionRepository.remove(id);
  }

  async endAllSessions(streamId: string, userId: string): Promise<void> {
    // Verify user is stream owner
    const stream = await this.streamService.findById(streamId, userId);
    if (stream.ownerId !== userId) {
      throw new ForbiddenException('Only stream owner can end all sessions');
    }

    await this.sessionRepository.endAllActiveSessions(streamId);
  }

  async getActiveParticipantCount(streamId: string, userId: string): Promise<number> {
    // Verify stream exists and user has access
    await this.streamService.findById(streamId, userId);

    return await this.sessionRepository.getActiveParticipantCount(streamId);
  }

  private toResponseDto(session: Session): SessionResponseDto {
    return {
      id: session.id,
      status: session.status,
      role: session.role,
      metadata: session.metadata,
      joinedAt: session.joinedAt,
      leftAt: session.leftAt,
      duration: session.duration,
      isAudioEnabled: session.isAudioEnabled,
      isVideoEnabled: session.isVideoEnabled,
      isScreenSharing: session.isScreenSharing,
      connectionQuality: session.connectionQuality,
      userId: session.userId,
      streamId: session.streamId,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  private toListDto(session: Session): SessionListDto {
    return {
      id: session.id,
      status: session.status,
      role: session.role,
      joinedAt: session.joinedAt,
      isAudioEnabled: session.isAudioEnabled,
      isVideoEnabled: session.isVideoEnabled,
      user: {
        id: session.user.id,
        name: session.user.name,
        avatar: session.user.avatar,
      },
    };
  }
}
