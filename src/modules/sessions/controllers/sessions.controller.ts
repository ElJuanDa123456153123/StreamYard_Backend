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
import { SessionService } from '../services/session.service';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';
import { SessionResponseDto, SessionListDto } from '../dto/session-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('streams/:streamId')
  async create(
    @Param('streamId') streamId: string,
    @Body() createSessionDto: CreateSessionDto,
    @Request() req,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.create(
      createSessionDto,
      req.user.userId,
      streamId,
    );
  }

  @Get()
  async findAll(): Promise<SessionListDto[]> {
    return await this.sessionService.findAll();
  }

  @Get('stream/:streamId')
  async findByStream(
    @Param('streamId') streamId: string,
    @Request() req,
  ): Promise<SessionListDto[]> {
    return await this.sessionService.findByStream(streamId, req.user.userId);
  }

  @Get('stream/:streamId/active')
  async findActiveByStream(
    @Param('streamId') streamId: string,
    @Request() req,
  ): Promise<SessionListDto[]> {
    return await this.sessionService.findActiveSessions(streamId, req.user.userId);
  }

  @Get('stream/:streamId/count')
  async getActiveCount(
    @Param('streamId') streamId: string,
    @Request() req,
  ): Promise<{ count: number }> {
    const count = await this.sessionService.getActiveParticipantCount(
      streamId,
      req.user.userId,
    );
    return { count };
  }

  @Get('my')
  async findByUser(@Request() req): Promise<SessionListDto[]> {
    return await this.sessionService.findByUser(req.user.userId, req.user.userId);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Request() req,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.findById(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
    @Request() req,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.update(id, updateSessionDto, req.user.userId);
  }

  @Post(':id/join')
  async joinSession(
    @Param('id') id: string,
    @Request() req,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.joinSession(id, req.user.userId);
  }

  @Post(':id/leave')
  async leaveSession(
    @Param('id') id: string,
    @Request() req,
  ): Promise<SessionResponseDto> {
    return await this.sessionService.leaveSession(id, req.user.userId);
  }

  @Post(':id/kick')
  @HttpCode(HttpStatus.NO_CONTENT)
  async kickParticipant(
    @Param('id') id: string,
    @Query('streamId') streamId: string,
    @Request() req,
  ): Promise<void> {
    await this.sessionService.kickParticipant(id, streamId, req.user.userId);
  }

  @Post('streams/:streamId/end-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async endAllSessions(
    @Param('streamId') streamId: string,
    @Request() req,
  ): Promise<void> {
    await this.sessionService.endAllSessions(streamId, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Request() req,
  ): Promise<void> {
    await this.sessionService.remove(id, req.user.userId);
  }
}
