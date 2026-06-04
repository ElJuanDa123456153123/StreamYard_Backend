import { IsString, IsOptional, IsEnum, IsBoolean, IsArray, IsInt, Min, Max, MinLength, MaxLength, IsDateString, ValidateNested } from 'class-validator';
import { StreamPrivacy, StreamPlatform } from '../entities/stream.entity';
import { Type } from 'class-transformer';

export class StreamSettingsDto {
  @IsOptional()
  @IsBoolean()
  enableChat?: boolean;

  @IsOptional()
  @IsBoolean()
  enableRecording?: boolean;

  @IsOptional()
  @IsBoolean()
  enableScreenShare?: boolean;

  @IsOptional()
  @IsBoolean()
  autoStart?: boolean;
}

export class CreateStreamDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsEnum(StreamPrivacy)
  privacy?: StreamPrivacy;

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
