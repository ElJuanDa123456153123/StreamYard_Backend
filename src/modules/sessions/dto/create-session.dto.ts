import { IsString, IsEnum, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { SessionRole } from '../entities/session.entity';

export class SessionMetadataDto {
  @IsOptional()
  @IsString()
  browser?: string;

  @IsOptional()
  @IsString()
  os?: string;

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  ip?: string;
}

export class CreateSessionDto {
  @IsEnum(SessionRole)
  role: SessionRole;

  @IsOptional()
  @ValidateNested()
  metadata?: SessionMetadataDto;
}
