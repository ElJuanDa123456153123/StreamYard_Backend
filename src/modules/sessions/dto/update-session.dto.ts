import { IsEnum, IsOptional, IsBoolean, IsString, ValidateNested, IsNumber } from 'class-validator';
import { SessionStatus } from '../entities/session.entity';
import { Type } from 'class-transformer';

export class ConnectionQualityDto {
  @IsOptional()
  @IsNumber()
  bitrate?: number;

  @IsOptional()
  @IsNumber()
  fps?: number;

  @IsOptional()
  @IsString()
  resolution?: string;

  @IsOptional()
  @IsNumber()
  packetLoss?: number;
}

export class UpdateSessionDto {
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsOptional()
  @IsBoolean()
  isAudioEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isVideoEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isScreenSharing?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionQualityDto)
  connectionQuality?: ConnectionQualityDto;
}
