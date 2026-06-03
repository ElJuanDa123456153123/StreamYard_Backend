import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stream, StreamStatus, StreamPrivacy } from '../entities/stream.entity';
import { CreateStreamDto } from '../dto/create-stream.dto';
import { UpdateStreamDto } from '../dto/update-stream.dto';

@Injectable()
export class StreamRepository {
  constructor(
    @InjectRepository(Stream)
    private readonly repository: Repository<Stream>,
  ) {}

  async create(createStreamDto: CreateStreamDto, ownerId: string): Promise<Stream> {
    const stream = this.repository.create({
      ...createStreamDto,
      ownerId,
    });
    return await this.repository.save(stream);
  }

  async findAll(): Promise<Stream[]> {
    return await this.repository.find({
      relations: ['owner', 'sessions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Stream> {
    return await this.repository.findOne({
      where: { id },
      relations: ['owner', 'sessions', 'sessions.user'],
    });
  }

  async findByOwner(ownerId: string): Promise<Stream[]> {
    return await this.repository.find({
      where: { ownerId },
      relations: ['sessions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: StreamStatus): Promise<Stream[]> {
    return await this.repository.find({
      where: { status },
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPublicStreams(limit: number = 50): Promise<Stream[]> {
    return await this.repository.find({
      where: { privacy: StreamPrivacy.PUBLIC },
      relations: ['owner'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findLiveStreams(): Promise<Stream[]> {
    return await this.repository.find({
      where: { status: StreamStatus.LIVE },
      relations: ['owner', 'sessions', 'sessions.user'],
      order: { viewerCount: 'DESC' },
    });
  }

  async findScheduledStreams(): Promise<Stream[]> {
    return await this.repository.find({
      where: { status: StreamStatus.SCHEDULED },
      relations: ['owner'],
      order: { scheduledFor: 'ASC' },
    });
  }

  async update(id: string, updateStreamDto: UpdateStreamDto): Promise<Stream> {
    await this.repository.update(id, updateStreamDto);
    return await this.findById(id);
  }

  async updateStatus(id: string, status: StreamStatus): Promise<Stream> {
    await this.repository.update(id, { status });
    return await this.findById(id);
  }

  async incrementViewerCount(id: string): Promise<void> {
    await this.repository.increment(id, 'viewerCount', 1);
  }

  async decrementViewerCount(id: string): Promise<void> {
    await this.repository.decrement(id, 'viewerCount', 1);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getStreamStats(): Promise<{
    total: number;
    live: number;
    scheduled: number;
    ended: number;
  }> {
    const [total, live, scheduled, ended] = await Promise.all([
      this.repository.count(),
      this.repository.count({ where: { status: StreamStatus.LIVE } }),
      this.repository.count({ where: { status: StreamStatus.SCHEDULED } }),
      this.repository.count({ where: { status: StreamStatus.ENDED } }),
    ]);

    return { total, live, scheduled, ended };
  }
}
