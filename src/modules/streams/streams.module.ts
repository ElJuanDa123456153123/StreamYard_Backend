import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StreamsController } from './controllers/streams.controller';
import { StreamService } from './services/stream.service';
import { StreamRepository } from './repositories/stream.repository';

import { Stream } from './entities/stream.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Stream, User])],
  controllers: [StreamsController],
  providers: [StreamService, StreamRepository],
  exports: [StreamService, StreamRepository],
})
export class StreamsModule {}
