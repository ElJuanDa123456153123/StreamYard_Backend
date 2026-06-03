import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto, UserProfileDto } from '../dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.userRepository.create(createUserDto);
    return this.toResponseDto(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => this.toResponseDto(user));
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.toResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return this.toResponseDto(user);
  }

  async findByGoogleId(googleId: string): Promise<User> {
    return await this.userRepository.findByGoogleId(googleId);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // Verify user exists
    await this.findById(id);

    // If updating email, check if new email is already taken
    if (updateUserDto.email) {
      const existingUser = await this.userRepository.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email is already in use');
      }
    }

    const user = await this.userRepository.update(id, updateUserDto);
    return this.toResponseDto(user);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.userRepository.remove(id);
  }

  async getProfile(id: string): Promise<UserProfileDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async verifyEmail(id: string): Promise<void> {
    await this.findById(id);
    await this.userRepository.verifyEmail(id);
  }

  async deactivateUser(id: string): Promise<void> {
    await this.findById(id);
    await this.userRepository.deactivateUser(id);
  }

  async activateUser(id: string): Promise<void> {
    await this.findById(id);
    await this.userRepository.activateUser(id);
  }

  async findOrCreateGoogleUser(
    googleId: string,
    email: string,
    name: string,
    avatar?: string,
  ): Promise<User> {
    let user = await this.userRepository.findByGoogleId(googleId);

    if (!user) {
      // Check if user exists with this email
      user = await this.userRepository.findByEmail(email);
      if (user) {
        // Link Google account to existing user
        await this.userRepository.update(user.id, { googleId });
        user.googleId = googleId;
      } else {
        // Create new user
        const createUserDto: CreateUserDto = {
          email,
          name,
          avatar,
          googleId,
          isEmailVerified: true,
        };
        user = await this.userRepository.create(createUserDto);
      }
    }

    return user;
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
