import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class RefreshTokenDto {
  refreshToken: string;
}

export class JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}
