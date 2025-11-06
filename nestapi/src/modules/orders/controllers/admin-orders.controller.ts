import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { AdminAuthGuard } from '../../../auth/guards/admin-auth.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UpdateOrderDto } from '../dto';

/**
 * Admin 订单管理控制器
 * 路由前缀: /api/admin/orders
 * 权限控制: 所有路由都需要管理员登录 + 相应权限
 */
@Controller('admin/orders')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * 获取所有订单（分页）
   * GET /api/admin/orders?page=1&limit=20
   * 权限: 所有管理员都可以查看
   */
  @Get()
  @Roles('admin', 'manager', 'operator')
  async getAllOrders(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    const result = await this.ordersService.getAllOrders(page, limit);
    return {
      code: 200,
      message: 'Success',
      data: result,
    };
  }

  /**
   * 按状态获取订单
   * GET /api/admin/orders/status/:status?page=1&limit=20
   * 权限: 所有管理员都可以查看
   */
  @Get('status/:status')
  @Roles('admin', 'manager', 'operator')
  async getOrdersByStatus(
    @Param('status') status: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    const result = await this.ordersService.getOrdersByStatusAdmin(
      status,
      page,
      limit,
    );
    return {
      code: 200,
      message: 'Success',
      data: result,
    };
  }

  /**
   * 获取订单详情
   * GET /api/admin/orders/:orderId
   * 权限: 所有管理员都可以查看
   */
  @Get(':orderId')
  @Roles('admin', 'manager', 'operator')
  async getOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    const order = await this.ordersService.getOrderById(orderId);
    return {
      code: 200,
      message: 'Success',
      data: order,
    };
  }

  /**
   * 更新订单（状态、备注、收货信息等）
   * PUT /api/admin/orders/:orderId
   * 权限: 只有 admin 和 manager 可以更新
   */
  @Put(':orderId')
  @Roles('admin', 'manager')
  async updateOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() updateDto: UpdateOrderDto,
  ) {
    const order = await this.ordersService.updateOrderByAdmin(
      orderId,
      updateDto,
    );
    return {
      code: 200,
      message: 'Order updated successfully',
      data: order,
    };
  }

  /**
   * 删除订单（硬删除）
   * DELETE /api/admin/orders/:orderId
   * 权限: 只有 admin 可以删除
   */
  @Delete(':orderId')
  @Roles('admin')
  async deleteOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    await this.ordersService.remove(orderId);
    return {
      code: 200,
      message: 'Order deleted successfully',
    };
  }
}
