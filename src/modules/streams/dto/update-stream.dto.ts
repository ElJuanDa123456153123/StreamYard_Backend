import { IsString, IsOptional, IsEnum, IsBoolean, IsArray, IsInt, Min, Max, IsDateString, ValidateNested } from 'class-validator';
import { StreamPrivacy, StreamPlatform, StreamStatus } from '../entities/stream.entity';
import { Type } from 'class-transformer';
import { StreamSettingsDto } from './create-stream.dto';

export class UpdateStreamDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsEnum(StreamPrivacy)
  privacy?: StreamPrivacy;

  @IsOptional()
  @IsEnum(StreamStatus)
  status?: StreamStatus;

  @IsOptional()
  @IsArray()
  @IsEnum(StreamPlatform, { each: true })
  platform?: StreamPlatform[];

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxParticipants?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => StreamSettingsDto)
  streamSettings?: StreamSettingsDto;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}
