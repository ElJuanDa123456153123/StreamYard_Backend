import { UserRole } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserProfileDto {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
}
