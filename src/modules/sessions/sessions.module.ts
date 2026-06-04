import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SessionsController } from './controllers/sessions.controller';
import { SessionService } from './services/session.service';
import { SessionRepository } from './repositories/session.repository';

import { Session } from './entities/session.entity';
import { User } from '../users/entities/user.entity';
import { Stream } from '../streams/entities/stream.entity';
import { StreamsModule } from '../streams/streams.module';

@Module({
  imports: [TypeOrmModule.forFeature([Session, User, Stream]), StreamsModule],
  controllers: [SessionsController],
  providers: [SessionService, SessionRepository],
  exports: [SessionService, SessionRepository],
})
export class SessionsModule {}
