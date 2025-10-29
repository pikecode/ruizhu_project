import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * 创建用户
   */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.usersRepository.findOne({
      where: [{ username: createUserDto.username }, { email: createUserDto.email }],
    });

    if (existingUser) {
      throw new BadRequestException('用户名或邮箱已存在');
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      registrationSource: 'web',
      status: 'active',
    });

    const savedUser = await this.usersRepository.save(user);
    const { password, ...result } = savedUser;
    return result;
  }

  /**
   * 获取所有用户
   */
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.find({
      where: { status: 'active' },
    });
    return users.map(user => {
      const { password, ...result } = user;
      return result;
    });
  }

  /**
   * 根据ID获取用户
   */
  async findOne(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersRepository.findOne({
      where: { id, status: 'active' },
    });
    if (!user) return null;
    const { password, ...result } = user;
    return result;
  }

  /**
   * 根据用户名查找用户（用于登录）
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username, status: 'active' },
    });
  }

  /**
   * 根据手机号查找用户（用于手机号登录）
   */
  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { phone, status: 'active' },
    });
  }

  /**
   * 根据openId查找用户（用于微信登录）
   */
  async findByOpenId(openId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { openId, status: 'active' },
    });
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email, status: 'active' },
    });
  }

  /**
   * 删除用户（软删除 - 标记为deleted）
   */
  async remove(id: number): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.usersRepository.update(id, { status: 'deleted' });
    return true;
  }

  /**
   * 用手机号授权创建或更新用户
   * @param phone 手机号
   * @param openId 微信openId
   * @param userData 用户数据（来自微信）
   */
  async createOrUpdateByPhone(
    phone: string | null,
    openId: string,
    userData?: Partial<User>,
  ): Promise<User> {
    // 先查找是否存在该手机号的用户
    let user = phone ? await this.usersRepository.findOne({
      where: { phone },
    }) : null;

    if (user) {
      // 更新现有用户
      await this.usersRepository.update(user.id, {
        ...userData,
        openId, // 绑定openId
        isPhoneAuthorized: true,
        status: 'active',
      });
      const updatedUser = await this.usersRepository.findOne({ where: { id: user.id } });
      if (!updatedUser) {
        throw new NotFoundException('用户不存在');
      }
      return updatedUser;
    }

    // 创建新用户
    user = this.usersRepository.create({
      phone,
      openId,
      isPhoneAuthorized: true,
      registrationSource: 'wechat_mini_program',
      status: 'active',
      ...userData,
    });

    return this.usersRepository.save(user);
  }

  /**
   * 将手机号绑定到现有的openId用户
   */
  async bindPhoneToOpenId(openId: string, phone: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { openId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const existingPhoneUser = await this.usersRepository.findOne({
      where: { phone },
    });

    if (existingPhoneUser && existingPhoneUser.id !== user.id) {
      throw new BadRequestException('该手机号已绑定其他账户');
    }

    await this.usersRepository.update(user.id, {
      phone,
      isPhoneAuthorized: true,
    });

    const updatedUser = await this.usersRepository.findOne({ where: { id: user.id } });
    if (!updatedUser) {
      throw new NotFoundException('用户不存在');
    }
    return updatedUser;
  }

  /**
   * 更新最后登录信息
   */
  async updateLastLogin(userId: number, ip: string): Promise<void> {
    await this.usersRepository.update(userId, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
      loginCount: () => 'login_count + 1',
    });
  }
}
