import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Order, OrderStatus } from './entities/order.entity';

@Controller('api/v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Create a new order (requires JWT authentication)
   */
  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const order = await this.ordersService.create(user.id, createOrderDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: '订单创建成功',
      data: order,
    };
  }

  /**
   * Get all orders (for admin use)
   */
  @Get()
  async findAll() {
    const orders = await this.ordersService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: '获取订单列表成功',
      data: orders,
    };
  }

  /**
   * Get current user's orders (requires JWT authentication)
   */
  @Get('my-orders')
  @UseGuards(JwtGuard)
  async getUserOrders(@CurrentUser() user: any) {
    const orders = await this.ordersService.findByUserId(user.id);
    return {
      statusCode: HttpStatus.OK,
      message: '获取用户订单成功',
      data: orders,
    };
  }

  /**
   * Get user order statistics (requires JWT authentication)
   */
  @Get('stats')
  @UseGuards(JwtGuard)
  async getUserStats(@CurrentUser() user: any) {
    const stats = await this.ordersService.getUserOrderStats(user.id);
    return {
      statusCode: HttpStatus.OK,
      message: '获取订单统计成功',
      data: stats,
    };
  }

  /**
   * Get a single order by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findOne(+id);
    if (!order) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: '订单不存在',
        data: null,
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: '获取订单详情成功',
      data: order,
    };
  }

  /**
   * Update order status (requires JWT authentication)
   */
  @Patch(':id/status')
  @UseGuards(JwtGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    const order = await this.ordersService.updateStatus(+id, status);
    return {
      statusCode: HttpStatus.OK,
      message: '订单状态更新成功',
      data: order,
    };
  }

  /**
   * Delete an order (requires JWT authentication)
   */
  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.ordersService.remove(+id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: '订单删除成功',
    };
  }
}
