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
import { AuthGuard } from '@nestjs/passport';
import type { CreateAdminUserDto, UpdateAdminUserDto } from './admin-users.service';
import { AdminUsersService } from './admin-users.service';

@Controller('admin/users')
@UseGuards(AuthGuard('jwt'))
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  /**
   * 获取当前登录的 Admin 用户信息
   * GET /api/admin/users/profile/current
   * 注：此路由必须放在 @Get(':id') 之前，避免被 :id 通配符匹配
   */
  @Get('profile/current')
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
   */
  @Get()
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
   */
  @Get(':id')
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
   */
  @Post()
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
   */
  @Patch(':id')
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
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.adminUsersService.remove(+id);

    return {
      code: 200,
      message: 'Admin user deleted successfully',
    };
  }
}
