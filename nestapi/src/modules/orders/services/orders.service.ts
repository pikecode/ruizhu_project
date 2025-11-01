import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../../entities/product.entity';
import { CreateOrderDto, UpdateOrderDto } from '../dto';
import { AddressesService } from '../../addresses/services/addresses.service';

// OrderItem interface for order items stored as JSON
export interface IOrderItem {
  productId: number;
  productName?: string;
  quantity: number;
  price: number;
  selectedAttributes?: Record<string, any>;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly addressesService: AddressesService,
  ) {}

  /**
   * Generate unique order number
   * Format: ORD-{timestamp}-{random}
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Create new order from cart items
   */
  async createOrder(
    userId: number,
    createDto: CreateOrderDto,
  ): Promise<Order> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (!createDto.items || createDto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Validate amounts
    if (createDto.totalAmount < 0) {
      throw new BadRequestException('Total amount must be non-negative');
    }

    if (createDto.shippingAmount && createDto.shippingAmount < 0) {
      throw new BadRequestException('Shipping amount must be non-negative');
    }

    if (createDto.discountAmount && createDto.discountAmount < 0) {
      throw new BadRequestException('Discount amount must be non-negative');
    }

    if (createDto.finalAmount < 0) {
      throw new BadRequestException('Final amount must be non-negative');
    }

    // Verify final amount calculation
    const calculatedFinalAmount =
      createDto.totalAmount +
      (createDto.shippingAmount || 0) -
      (createDto.discountAmount || 0);

    if (calculatedFinalAmount !== createDto.finalAmount) {
      throw new BadRequestException(
        'Final amount calculation is incorrect. Expected: ' +
          calculatedFinalAmount,
      );
    }

    // Validate address exists and belongs to user
    await this.addressesService.getAddress(userId, createDto.addressId);

    // Create order
    const order = this.orderRepository.create({
      userId,
      orderNo: this.generateOrderNumber(),
      subtotal: createDto.totalAmount,
      shippingCost: createDto.shippingAmount || 0,
      discountAmount: createDto.discountAmount || 0,
      totalAmount: createDto.finalAmount,
      paymentStatus: 'unpaid',
      notes: createDto.remark,
      status: 'pending',
    });

    return await this.orderRepository.save(order);
  }

  /**
   * Get single order by ID
   */
  async getOrder(userId: number, orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        userId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Get all orders for a user with pagination
   */
  async getUserOrders(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    items: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await this.orderRepository.findAndCount({
      where: { userId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(
    userId: number,
    status: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    orders: Order[];
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const validStatuses = [
      'pending',
      'paid',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where: {
        userId,
        status,
      },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { orders, total };
  }

  /**
   * Update order (status, remark, shipping info)
   */
  async updateOrder(
    userId: number,
    orderId: number,
    updateDto: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.getOrder(userId, orderId);

    // Only allow status update if order is in appropriate state
    if (updateDto.status) {
      const validStatuses = [
        'pending',
        'paid',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ];
      if (!validStatuses.includes(updateDto.status)) {
        throw new BadRequestException('Invalid order status');
      }

      // Validate status transitions
      const currentStatus = order.status;
      const canTransitionTo = this.canTransitionStatus(
        currentStatus,
        updateDto.status,
      );

      if (!canTransitionTo) {
        throw new BadRequestException(
          `Cannot transition from ${currentStatus} to ${updateDto.status}`,
        );
      }

      order.status = updateDto.status;

      // Update status-specific timestamps
      if (updateDto.status === 'shipped') {
        order.shippedAt = new Date();
      } else if (updateDto.status === 'delivered') {
        order.deliveredAt = new Date();
      }
    }

    if (updateDto.remark !== undefined) {
      order.notes = updateDto.remark;
    }

    return await this.orderRepository.save(order);
  }

  /**
   * Cancel order
   */
  async cancelOrder(userId: number, orderId: number): Promise<Order> {
    const order = await this.getOrder(userId, orderId);

    if (!['pending', 'paid'].includes(order.status)) {
      throw new BadRequestException(
        'Can only cancel pending or paid orders',
      );
    }

    order.status = 'cancelled';

    return await this.orderRepository.save(order);
  }

  /**
   * Get order statistics for user
   */
  async getUserOrderStats(userId: number): Promise<{
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    completedOrders: number;
  }> {
    const orders = await this.orderRepository.find({
      where: { userId },
    });

    return {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      completedOrders: orders.filter((o) => o.status === 'delivered').length,
    };
  }

  /**
   * Validate order status transitions
   * pending -> paid, cancelled
   * paid -> shipped, refunded
   * shipped -> delivered
   * delivered -> (final state)
   * cancelled -> (final state)
   * refunded -> (final state)
   */
  private canTransitionStatus(fromStatus: string, toStatus: string): boolean {
    const transitions = {
      pending: ['paid', 'cancelled'],
      paid: ['shipped', 'refunded', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [], // Final state
      cancelled: [], // Final state
      refunded: [], // Final state
    };

    return transitions[fromStatus]?.includes(toStatus) ?? false;
  }

  /**
   * Mark order as paid
   */
  async markOrderAsPaid(
    userId: number,
    orderId: number,
    paymentId?: number,
  ): Promise<Order> {
    const order = await this.getOrder(userId, orderId);

    if (order.status !== 'pending') {
      throw new BadRequestException('Only pending orders can be marked as paid');
    }

    order.status = 'paid';
    order.paymentStatus = 'paid';
    if (paymentId) {
      order.paidAt = new Date();
    }

    return await this.orderRepository.save(order);
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderNo: orderNumber },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Search orders (admin function)
   */
  async searchOrders(
    filters: {
      userId?: number;
      status?: string;
      dateFrom?: Date;
      dateTo?: Date;
      minAmount?: number;
      maxAmount?: number;
    },
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    let query = this.orderRepository.createQueryBuilder('order');

    if (filters.userId) {
      query = query.where('order.userId = :userId', { userId: filters.userId });
    }

    if (filters.status) {
      query = query.andWhere('order.status = :status', {
        status: filters.status,
      });
    }

    if (filters.dateFrom) {
      query = query.andWhere('order.createdAt >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters.dateTo) {
      query = query.andWhere('order.createdAt <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    if (filters.minAmount) {
      query = query.andWhere('order.finalAmount >= :minAmount', {
        minAmount: filters.minAmount,
      });
    }

    if (filters.maxAmount) {
      query = query.andWhere('order.finalAmount <= :maxAmount', {
        maxAmount: filters.maxAmount,
      });
    }

    const skip = (page - 1) * limit;
    const [orders, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('order.createdAt', 'DESC')
      .getManyAndCount();

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Admin: Get all orders with pagination
   */
  async getAllOrders(
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    items: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await this.orderRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Admin: Get orders by status
   */
  async getOrdersByStatusAdmin(
    status: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    items: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const validStatuses = [
      'pending',
      'paid',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    const [orders, total] = await this.orderRepository.findAndCount({
      where: { status },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      items: orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Admin: Get order by ID (no user check)
   */
  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Admin: Update order (no user ownership check)
   */
  async updateOrderByAdmin(
    orderId: number,
    updateDto: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.getOrderById(orderId);

    if (updateDto.status) {
      const validStatuses = [
        'pending',
        'paid',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ];
      if (!validStatuses.includes(updateDto.status)) {
        throw new BadRequestException('Invalid order status');
      }

      const canTransition = this.canTransitionStatus(
        order.status,
        updateDto.status,
      );
      if (!canTransition) {
        throw new BadRequestException(
          `Cannot transition from ${order.status} to ${updateDto.status}`,
        );
      }

      order.status = updateDto.status;

      if (updateDto.status === 'shipped') {
        order.shippedAt = new Date();
      } else if (updateDto.status === 'delivered') {
        order.deliveredAt = new Date();
      }
    }

    if (updateDto.remark !== undefined) {
      order.notes = updateDto.remark;
    }

    return await this.orderRepository.save(order);
  }
}
