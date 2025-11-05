import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from '../../entities/admin-user.entity';

export interface CreateAdminUserDto {
  username: string;
  email?: string;
  password: string;
  nickname?: string;
  role?: 'admin' | 'manager' | 'operator';
  isSuperAdmin?: boolean;
}

export interface UpdateAdminUserDto {
  email?: string;
  nickname?: string;
  password?: string;
  role?: 'admin' | 'manager' | 'operator';
  status?: 'active' | 'inactive' | 'banned';
  permissions?: Record<string, any>;
}

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUsersRepository: Repository<AdminUser>,
  ) {}

  /**
   * 创建 Admin 用户
   */
  async create(createAdminUserDto: CreateAdminUserDto): Promise<Omit<AdminUser, 'password'>> {
    const existingUser = await this.adminUsersRepository.findOne({
      where: [{ username: createAdminUserDto.username }, { email: createAdminUserDto.email }],
    });

    if (existingUser) {
      throw new BadRequestException('用户名或邮箱已存在');
    }

    const adminUser = this.adminUsersRepository.create({
      ...createAdminUserDto,
      status: 'active',
    });

    const savedUser = await this.adminUsersRepository.save(adminUser);
    const { password, ...result } = savedUser;
    return result;
  }

  /**
   * 获取所有 Admin 用户
   */
  async findAll(): Promise<Omit<AdminUser, 'password'>[]> {
    const users = await this.adminUsersRepository.find({
      where: { status: 'active' },
      order: { createdAt: 'DESC' },
    });
    return users.map((user) => {
      const { password, ...result } = user;
      return result;
    });
  }

  /**
   * 根据 ID 获取 Admin 用户
   */
  async findOne(id: number): Promise<Omit<AdminUser, 'password'> | null> {
    const user = await this.adminUsersRepository.findOne({
      where: { id, status: 'active' },
    });
    if (!user) return null;
    const { password, ...result } = user;
    return result;
  }

  /**
   * 根据用户名查找 Admin 用户（用于登录）
   */
  async findByUsername(username: string): Promise<AdminUser | null> {
    return this.adminUsersRepository.findOne({
      where: { username, status: 'active' },
    });
  }

  /**
   * 根据邮箱查找 Admin 用户
   */
  async findByEmail(email: string): Promise<AdminUser | null> {
    return this.adminUsersRepository.findOne({
      where: { email, status: 'active' },
    });
  }

  /**
   * 更新 Admin 用户
   */
  async update(
    id: number,
    updateAdminUserDto: UpdateAdminUserDto,
  ): Promise<Omit<AdminUser, 'password'>> {
    const user = await this.adminUsersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.adminUsersRepository.update(id, updateAdminUserDto);
    const updatedUser = await this.adminUsersRepository.findOne({ where: { id } });

    if (!updatedUser) {
      throw new NotFoundException('用户不存在');
    }

    const { password, ...result } = updatedUser;
    return result;
  }

  /**
   * 删除 Admin 用户（软删除）
   */
  async remove(id: number): Promise<boolean> {
    const user = await this.adminUsersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.adminUsersRepository.update(id, { status: 'inactive' });
    return true;
  }

  /**
   * 更新最后登录信息
   */
  async updateLastLogin(userId: number, ip: string): Promise<void> {
    await this.adminUsersRepository.update(userId, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
      loginCount: () => 'login_count + 1',
    });
  }

  /**
   * 获取 Admin 用户列表（分页）
   */
  async getPaginatedUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    items: Omit<AdminUser, 'password'>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [users, total] = await this.adminUsersRepository.findAndCount({
      where: { status: 'active' },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const usersWithoutPassword = users.map((user) => {
      const { password, ...result } = user;
      return result;
    });

    return {
      items: usersWithoutPassword,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
