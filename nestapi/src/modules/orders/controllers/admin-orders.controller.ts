import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../../../auth/guards/admin-auth.guard';
import { OrdersService } from '../services/orders.service';
import { UpdateOrderDto } from '../dto';

/**
 * Admin 订单管理控制器
 * 所有接口都需要 Admin 认证
 * 路由前缀: /api/admin/orders
 */
@Controller('admin/orders')
@UseGuards(AdminAuthGuard)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * 获取所有订单（分页）
   * GET /api/admin/orders?page=1&limit=20
   */
  @Get()
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
   */
  @Get('status/:status')
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
   */
  @Get(':orderId')
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
   */
  @Put(':orderId')
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
}
