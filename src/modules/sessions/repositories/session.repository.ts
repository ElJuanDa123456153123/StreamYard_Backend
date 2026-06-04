import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session, SessionStatus } from '../entities/session.entity';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(Session)
    private readonly repository: Repository<Session>,
  ) {}

  async create(
    createSessionDto: CreateSessionDto,
    userId: string,
    streamId: string,
  ): Promise<Session> {
    const session = this.repository.create({
      ...createSessionDto,
      userId,
      streamId,
      joinedAt: new Date(),
    });
    return await this.repository.save(session);
  }

  async findAll(): Promise<Session[]> {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Session> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  async findByStream(streamId: string): Promise<Session[]> {
    return await this.repository.find({
      where: { streamId },
      order: { joinedAt: 'ASC' },
    });
  }

  async findByUser(userId: string): Promise<Session[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveSessions(streamId: string): Promise<Session[]> {
    return await this.repository.find({
      where: {
        streamId,
        status: SessionStatus.ACTIVE,
      },
    });
  }

  async findByUserAndStream(userId: string, streamId: string): Promise<Session> {
    return await this.repository.findOne({
      where: { userId, streamId },
    });
  }

  async update(id: string, updateSessionDto: UpdateSessionDto): Promise<Session> {
    await this.repository.update(id, updateSessionDto);
    return await this.findById(id);
  }

  async updateStatus(id: string, status: SessionStatus): Promise<Session> {
    const updateData: any = { status };

    if (status === SessionStatus.ENDED || status === SessionStatus.KICKED) {
      updateData.leftAt = new Date();
    }

    if (status === SessionStatus.ACTIVE && !updateData.joinedAt) {
      updateData.joinedAt = new Date();
    }

    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getActiveParticipantCount(streamId: string): Promise<number> {
    return await this.repository.count({
      where: {
        streamId,
        status: SessionStatus.ACTIVE,
      },
    });
  }

  async removeAllFromStream(streamId: string): Promise<void> {
    await this.repository.delete({ streamId });
  }

  async endAllActiveSessions(streamId: string): Promise<void> {
    await this.repository.update(
      { streamId, status: SessionStatus.ACTIVE },
      { status: SessionStatus.ENDED, leftAt: new Date() },
    );
  }
}
