import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../users/services/user.service';
import { User } from '../../users/entities/user.entity';
import { LoginDto, RegisterDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { JwtPayload } from '../dto/auth-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    try {
      await this.userService.findByEmail(registerDto.email);
      throw new BadRequestException('User with this email already exists');
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.userService.create({
      ...registerDto,
      password: hashedPassword,
      isEmailVerified: false,
    });

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 7 * 24 * 60 * 60,
    };
  }

  async validateGoogleUser(
    googleId: string,
    email: string,
    name: string,
    avatar?: string,
  ): Promise<AuthResponseDto> {
    const user = await this.userService.findOrCreateGoogleUser(googleId, email, name, avatar);

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 7 * 24 * 60 * 60,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User account is deactivated');
      }

      const tokens = await this.generateTokens(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 7 * 24 * 60 * 60,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async verifyJwt(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }
}
