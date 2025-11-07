import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll() {
    return this.usersService.findAll();
  }

  /**
   * Get current user's profile
   * GET /api/users/profile
   * Uses JWT token to identify the user
   */
  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    console.log('📍 [UsersController] GET /users/profile 被调用');
    console.log('  - 从JWT提取的用户ID:', req.user?.sub || req.user?.id);

    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      console.warn('⚠️ [UsersController] JWT中未找到用户ID');
      return { code: 400, message: '无效的用户信息' };
    }

    const user = await this.usersService.findOne(userId);
    if (!user) {
      console.warn('⚠️ [UsersController] 用户未找到或已删除:', userId);
      return { code: 404, message: '用户不存在' };
    }

    console.log('✅ [UsersController] 用户信息已返回:', {
      id: user.id,
      discount: user.discount,
    });

    return user;
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string) {
    const userId = +id;
    console.log('📍 [UsersController] GET /users/:id 被调用');
    console.log('  - 请求的用户ID:', userId);

    const user = await this.usersService.findOne(userId);
    if (!user) {
      console.warn('⚠️ [UsersController] 用户未找到或已删除:', userId);
      return { code: 404, message: '用户不存在' };
    }

    console.log('✅ [UsersController] 用户信息已返回:', {
      id: user.id,
      discount: user.discount,
    });

    return user;
  }

  /**
   * Deactivate current user account
   * DELETE /api/users/deactivate
   */
  @Delete('deactivate')
  @UseGuards(AuthGuard('jwt'))
  async deactivateAccount(@Request() req) {
    await this.usersService.remove(req.user.id);
    return { message: 'Account deactivated successfully' };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  /**
   * Update user information (e.g., discount field)
   * PATCH /api/users/:id
   */
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
}
