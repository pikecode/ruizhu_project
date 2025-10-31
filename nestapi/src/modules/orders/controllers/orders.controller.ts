import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, UpdateOrderDto } from '../dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Create new order
   * POST /api/orders
   */
  @Post()
  @ApiOperation({ summary: 'Create new order' })
  async createOrder(@Request() req, @Body() createDto: CreateOrderDto) {
    return await this.ordersService.createOrder(req.user.id, createDto);
  }

  /**
   * Get all orders for current user with pagination
   * GET /api/orders?page=1&limit=20
   */
  @Get()
  @ApiOperation({ summary: 'Get user orders' })
  async getUserOrders(
    @Request() req,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return await this.ordersService.getUserOrders(
      req.user.id,
      page,
      limit,
    );
  }

  /**
   * Get order statistics for current user
   * GET /api/orders/stats/summary
   * Must be before :orderId route
   */
  @Get('stats/summary')
  @ApiOperation({ summary: 'Get order statistics' })
  async getOrderStats(@Request() req) {
    return await this.ordersService.getUserOrderStats(req.user.id);
  }

  /**
   * Get pending orders count
   * GET /api/orders/pending/count
   * Must be before :orderId route
   */
  @Get('pending/count')
  @ApiOperation({ summary: 'Get pending orders count' })
  async getPendingOrdersCount(@Request() req) {
    const { orders } = await this.ordersService.getOrdersByStatus(
      req.user.id,
      'pending',
      1,
      1000,
    );
    return { pendingCount: orders.length };
  }

  /**
   * Get orders filtered by status
   * GET /api/orders/status/:status?page=1&limit=20
   * Must be before :orderId route
   */
  @Get('status/:status')
  @ApiOperation({ summary: 'Get orders by status' })
  async getOrdersByStatus(
    @Request() req,
    @Param('status') status: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return await this.ordersService.getOrdersByStatus(
      req.user.id,
      status,
      page,
      limit,
    );
  }

  /**
   * Get single order by ID
   * GET /api/orders/:orderId
   * Must be after all specific routes
   */
  @Get(':orderId')
  @ApiOperation({ summary: 'Get order details' })
  async getOrder(
    @Request() req,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    return await this.ordersService.getOrder(req.user.id, orderId);
  }

  /**
   * Update order (status, remark, shipping info)
   * PUT /api/orders/:orderId
   */
  @Put(':orderId')
  @ApiOperation({ summary: 'Update order' })
  async updateOrder(
    @Request() req,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() updateDto: UpdateOrderDto,
  ) {
    return await this.ordersService.updateOrder(
      req.user.id,
      orderId,
      updateDto,
    );
  }

  /**
   * Cancel order
   * PUT /api/orders/:orderId/cancel
   */
  @Put(':orderId/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  async cancelOrder(
    @Request() req,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    await this.ordersService.cancelOrder(req.user.id, orderId);
    return { message: 'Order cancelled successfully' };
  }
}
