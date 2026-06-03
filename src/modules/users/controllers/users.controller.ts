import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto, UserProfileDto } from '../dto/user-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req): Promise<UserProfileDto> {
    return await this.userService.getProfile(req.user.userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return await this.userService.update(req.user.userId, updateUserDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.userService.findById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.userService.remove(id);
  }

  @Put(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deactivateUser(@Param('id') id: string): Promise<void> {
    await this.userService.deactivateUser(id);
  }

  @Put(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async activateUser(@Param('id') id: string): Promise<void> {
    await this.userService.activateUser(id);
  }

  @Put(':id/verify-email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async verifyEmail(@Param('id') id: string): Promise<void> {
    await this.userService.verifyEmail(id);
  }
}
