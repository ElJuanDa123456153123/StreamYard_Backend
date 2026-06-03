import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.repository.create(createUserDto);
    return await this.repository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find({
      relations: ['streams', 'sessions'],
    });
  }

  async findById(id: string): Promise<User> {
    return await this.repository.findOne({
      where: { id },
      relations: ['streams', 'sessions'],
    });
  }

  async findByEmail(email: string): Promise<User> {
    return await this.repository.findOne({
      where: { email },
    });
  }

  async findByGoogleId(googleId: string): Promise<User> {
    return await this.repository.findOne({
      where: { googleId },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.repository.update(id, updateUserDto);
    return await this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findActiveUsers(): Promise<User[]> {
    return await this.repository.find({
      where: { isActive: true },
    });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return await this.repository.find({
      where: { role },
    });
  }

  async verifyEmail(id: string): Promise<void> {
    await this.repository.update(id, { isEmailVerified: true });
  }

  async deactivateUser(id: string): Promise<void> {
    await this.repository.update(id, { isActive: false });
  }

  async activateUser(id: string): Promise<void> {
    await this.repository.update(id, { isActive: true });
  }
}
