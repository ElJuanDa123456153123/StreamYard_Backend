import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StreamService } from '../services/stream.service';
import { CreateStreamDto } from '../dto/create-stream.dto';
import { UpdateStreamDto } from '../dto/update-stream.dto';
import { StreamResponseDto, StreamListDto, StreamStatsDto } from '../dto/stream-response.dto';
import { StreamStatus } from '../entities/stream.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('streams')
@UseGuards(JwtAuthGuard)
export class StreamsController {
  constructor(private readonly streamService: StreamService) {}

  @Post()
  async create(
    @Body() createStreamDto: CreateStreamDto,
    @Request() req,
  ): Promise<StreamResponseDto> {
    return await this.streamService.create(createStreamDto, req.user.userId);
  }

  @Get()
  async findAll(@Request() req): Promise<StreamListDto[]> {
    return await this.streamService.findAll(req.user.userId);
  }

  @Get('public')
  async findPublic(
    @Query('limit') limit?: number,
  ): Promise<StreamListDto[]> {
    return await this.streamService.findPublicStreams(limit);
  }

  @Get('live')
  async findLive(): Promise<StreamListDto[]> {
    return await this.streamService.findLiveStreams();
  }

  @Get('scheduled')
  async findScheduled(): Promise<StreamListDto[]> {
    return await this.streamService.findScheduledStreams();
  }

  @Get('stats')
  async getStats(): Promise<StreamStatsDto> {
    return await this.streamService.getStats();
  }

  @Get('my')
  async findMy(@Request() req): Promise<StreamListDto[]> {
    return await this.streamService.findByOwner(req.user.userId, req.user.userId);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Request() req,
  ): Promise<StreamResponseDto> {
    return await this.streamService.findById(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStreamDto: UpdateStreamDto,
    @Request() req,
  ): Promise<StreamResponseDto> {
    return await this.streamService.update(id, updateStreamDto, req.user.userId);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: StreamStatus,
    @Request() req,
  ): Promise<StreamResponseDto> {
    return await this.streamService.updateStatus(id, status, req.user.userId);
  }

  @Post(':id/viewers')
  @HttpCode(HttpStatus.NO_CONTENT)
  async incrementViewers(@Param('id') id: string): Promise<void> {
    await this.streamService.incrementViewerCount(id);
  }

  @Delete(':id/viewers')
  @HttpCode(HttpStatus.NO_CONTENT)
  async decrementViewers(@Param('id') id: string): Promise<void> {
    await this.streamService.decrementViewerCount(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Request() req,
  ): Promise<void> {
    await this.streamService.remove(id, req.user.userId);
  }
}
