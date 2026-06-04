import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return await this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req): Promise<AuthResponseDto> {
    return await this.authService.login(req.user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string): Promise<AuthResponseDto> {
    return await this.authService.refreshTokens(refreshToken);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(): Promise<void> {
    // Redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res: Response): Promise<void> {
    const { googleId, email, name, avatar } = req.user;
    const authResponse = await this.authService.validateGoogleUser(googleId, email, name, avatar);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    // Redirigir al frontend con los tokens como parámetros de query
    res.redirect(
      `${frontendUrl}/auth/callback?` +
        `accessToken=${authResponse.accessToken}&` +
        `refreshToken=${authResponse.refreshToken}&` +
        `user=${encodeURIComponent(JSON.stringify(authResponse.user))}`
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req): Promise<any> {
    return {
      user: req.user,
      message: 'Authenticated successfully',
    };
  }
}
