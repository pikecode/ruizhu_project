import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginLog } from './entities/login-log.entity';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(LoginLog)
    private loginLogRepository: Repository<LoginLog>,
  ) {}

  // Register a new user
  async register(
    registerDto: AuthRegisterDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    // Check if username already exists
    const existingUserByUsername = await this.usersService.findByUsername(
      registerDto.username,
    );
    if (existingUserByUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists
    const existingUserByEmail = await this.usersService.findByEmail(
      registerDto.email,
    );
    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    // Create user
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Log the registration
    await this.createLoginLog(user.id, ipAddress, userAgent, 'success', 'password');

    // Generate tokens
    return this.generateAuthResponse(user, ipAddress, userAgent);
  }

  // Login user
  async login(
    loginDto: AuthLoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      // Log failed login attempt
      const failedUser = await this.usersService.findByUsername(loginDto.username);
      if (failedUser) {
        await this.createLoginLog(
          failedUser.id,
          ipAddress,
          userAgent,
          'failed',
          'password',
          'Invalid password',
        );
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      await this.createLoginLog(
        user.id,
        ipAddress,
        userAgent,
        'blocked',
        'password',
        'Account is inactive',
      );
      throw new UnauthorizedException('Account is inactive');
    }

    // Update last login info
    await this.usersService.updateLastLogin(user.id, ipAddress);

    // Log successful login
    await this.createLoginLog(user.id, ipAddress, userAgent, 'success', 'password');

    // Generate tokens
    return this.generateAuthResponse(user, ipAddress, userAgent);
  }

  // Validate user credentials
  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  // Validate JWT token
  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Refresh access token
  async refreshToken(
    refreshTokenString: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    // Find refresh token in database
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenString, isRevoked: false },
      relations: ['user', 'user.role', 'user.role.permissions'],
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token has expired
    if (new Date() > refreshToken.expiresAt) {
      await this.revokeRefreshToken(refreshTokenString);
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Check if user is active
    if (!refreshToken.user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Log the refresh token usage
    await this.createLoginLog(
      refreshToken.user.id,
      ipAddress,
      userAgent,
      'success',
      'refresh_token',
    );

    // Revoke old refresh token
    await this.revokeRefreshToken(refreshTokenString);

    // Generate new tokens
    return this.generateAuthResponse(refreshToken.user, ipAddress, userAgent);
  }

  // Change password
  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    // Validate that new password matches confirmation
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('New password and confirmation do not match');
    }

    // Get user
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.password,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 12);

    // Update password
    await this.usersService.updatePassword(userId, hashedPassword);

    // Revoke all refresh tokens for this user
    await this.revokeAllUserRefreshTokens(userId);

    return { message: 'Password changed successfully' };
  }

  // Update user profile
  async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<any> {
    // Check if email is being updated and already exists
    if (updateProfileDto.email) {
      const existingUser = await this.usersService.findByEmail(
        updateProfileDto.email,
      );
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already exists');
      }
    }

    return this.usersService.update(userId, updateProfileDto);
  }

  // Logout user
  async logout(refreshTokenString: string): Promise<{ message: string }> {
    await this.revokeRefreshToken(refreshTokenString);
    return { message: 'Logged out successfully' };
  }

  // Get current user info
  async getMe(userId: number): Promise<any> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Helper: Generate auth response with tokens
  private async generateAuthResponse(
    user: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
    };

    // Generate access token (1 day expiry)
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });

    // Generate refresh token (7 days expiry)
    const refreshToken = await this.createRefreshToken(
      user.id,
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      refreshToken: refreshToken.token,
      expiresIn: 86400, // 1 day in seconds
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        realName: user.realName,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role
          ? {
              id: user.role.id,
              name: user.role.name,
              code: user.role.code,
              permissions: user.role.permissions?.map((p) => ({
                id: p.id,
                name: p.name,
                code: p.code,
              })) || [],
            }
          : undefined,
      },
    };
  }

  // Helper: Create refresh token
  private async createRefreshToken(
    userId: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RefreshToken> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshToken = this.refreshTokenRepository.create({
      token,
      userId,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  // Helper: Revoke refresh token
  private async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token },
      { isRevoked: true },
    );
  }

  // Helper: Revoke all user refresh tokens
  private async revokeAllUserRefreshTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  // Helper: Create login log
  private async createLoginLog(
    userId: number,
    ipAddress?: string,
    userAgent?: string,
    loginStatus: string = 'success',
    loginMethod: string = 'password',
    failureReason?: string,
  ): Promise<void> {
    const loginLog = this.loginLogRepository.create({
      userId,
      ipAddress,
      userAgent,
      loginStatus,
      loginMethod,
      failureReason,
    });

    await this.loginLogRepository.save(loginLog);
  }
}
