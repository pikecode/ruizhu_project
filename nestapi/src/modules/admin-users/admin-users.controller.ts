import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminAuthGuard } from '../../auth/guards/admin-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import type { CreateAdminUserDto, UpdateAdminUserDto } from './admin-users.service';
import { AdminUsersService } from './admin-users.service';

@Controller('admin/users')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  /**
   * 获取当前登录的 Admin 用户信息
   * GET /api/admin/users/profile/current
   * 注：此路由必须放在 @Get(':id') 之前，避免被 :id 通配符匹配
   * 权限: 所有管理员都可以查看自己的信息
   */
  @Get('profile/current')
  @Roles('admin', 'manager', 'operator')
  async getCurrentProfile(@Request() req) {
    const user = await this.adminUsersService.findOne(req.user.sub);

    return {
      code: 200,
      message: 'Success',
      data: user,
    };
  }

  /**
   * 获取 Admin 用户列表（分页）
   * GET /api/admin/users?page=1&limit=10
   * 权限: 只有 admin 可以查看用户列表
   */
  @Get()
  @Roles('admin')
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const result = await this.adminUsersService.getPaginatedUsers(pageNum, limitNum);

    return {
      code: 200,
      message: 'Success',
      data: result,
    };
  }

  /**
   * 获取单个 Admin 用户
   * GET /api/admin/users/:id
   * 注：此路由必须放在最后，因为 :id 是通配符会匹配任何路径
   * 权限: 只有 admin 可以查看用户详情
   */
  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    const user = await this.adminUsersService.findOne(+id);

    return {
      code: 200,
      message: 'Success',
      data: user,
    };
  }

  /**
   * 创建 Admin 用户
   * POST /api/admin/users
   * 权限: 只有 admin 可以创建新用户
   */
  @Post()
  @Roles('admin')
  async create(@Body() createAdminUserDto: CreateAdminUserDto) {
    const user = await this.adminUsersService.create(createAdminUserDto);

    return {
      code: 201,
      message: 'Admin user created successfully',
      data: user,
    };
  }

  /**
   * 更新 Admin 用户
   * PATCH /api/admin/users/:id
   * 权限: 只有 admin 可以更新用户
   */
  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
  ) {
    const user = await this.adminUsersService.update(+id, updateAdminUserDto);

    return {
      code: 200,
      message: 'Admin user updated successfully',
      data: user,
    };
  }

  /**
   * 删除 Admin 用户
   * DELETE /api/admin/users/:id
   * 权限: 只有 admin 可以删除用户
   */
  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: string) {
    await this.adminUsersService.remove(+id);

    return {
      code: 200,
      message: 'Admin user deleted successfully',
    };
  }
}
