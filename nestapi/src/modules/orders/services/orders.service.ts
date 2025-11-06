import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, DataSource } from 'typeorm';
import { Order, OrderItem, Product } from '../../../entities/product.entity';
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
  private readonly logger = new Logger(OrdersService.name);

  // 订单超时时间（分钟）- 30分钟内必须支付
  private readonly ORDER_TIMEOUT_MINUTES = 30;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly addressesService: AddressesService,
    private readonly dataSource: DataSource,
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

    // Validate address exists and fetch full address data (skip for recharge orders)
    let shippingAddress: Record<string, any> | undefined;
    if (!createDto.isRecharge && createDto.addressId) {
      const address = await this.addressesService.getAddress(userId, createDto.addressId);
      shippingAddress = {
        id: address.id,
        receiverName: address.receiverName,
        receiverPhone: address.receiverPhone,
        province: address.province,
        city: address.city,
        district: address.district,
        addressDetail: address.addressDetail,
        postalCode: address.postalCode,
        label: address.label,
      };
    }

    // Create order with full address information
    const order = this.orderRepository.create({
      userId,
      orderNo: this.generateOrderNumber(),
      // 🔴 重要: 保存完整地址信息到shippingAddress JSON字段，而不是addressId
      ...(shippingAddress && { shippingAddress }),
      subtotal: createDto.totalAmount,  // Items total (in cents)
      shippingCost: createDto.shippingAmount || 0,  // Shipping cost (in cents)
      discountAmount: createDto.discountAmount || 0,  // Additional discounts (in cents)
      totalAmount: createDto.finalAmount,  // Final amount to pay (in cents)
      notes: createDto.remark,
      status: 'pending',  // Order awaiting payment
    });

    const savedOrder = await this.orderRepository.save(order);

    // 扣减库存：订单创建时立即扣减库存（使用乐观锁防止超卖）
    // 乐观锁原理: 通过version字段版本检查，确保并发时库存正确扣减
    for (const item of createDto.items) {
      const product = await this.getProductById(item.productId);

      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `产品 ${product.name} 库存不足，仅剩 ${product.stockQuantity} 件`,
        );
      }

      // 使用乐观锁更新库存：只有当version匹配时才成功更新
      // 如果其他请求并发修改了该产品，这里会失败，需要重试
      // 注意: version字段暂未在数据库中实现，使用简单的ID匹配更新
      const updateResult = await this.productRepository.update(
        {
          id: product.id,
          // version: product.version  // 乐观锁条件（已禁用，等待数据库迁移）
        },
        {
          stockQuantity: product.stockQuantity - item.quantity,
          // 使用 () => '...' 语法执行数据库函数来递增版本
          // version: () => 'version + 1',  // （已禁用，等待数据库迁移）
          // 动态计算库存状态
          stockStatus:
            product.stockQuantity - item.quantity <= 0
              ? 'soldOut'
              : product.stockQuantity - item.quantity <= product.lowStockThreshold
              ? 'outOfStock'
              : 'normal',
          isSoldOut:
            product.stockQuantity - item.quantity <= 0 ? true : false,
          isOutOfStock:
            product.stockQuantity - item.quantity > 0 &&
            product.stockQuantity - item.quantity <= product.lowStockThreshold
              ? true
              : false,
        },
      );

      // 检查是否成功更新（乐观锁冲突检测）
      if (updateResult.affected === 0) {
        throw new BadRequestException(
          `产品 ${product.name} 库存已被其他订单占用，请重试。(乐观锁冲突)`,
        );
      }
    }

    return savedOrder;
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
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        userId,
      },
      relations: ['items'], // Load order items for stock restoration
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!['pending', 'paid'].includes(order.status)) {
      throw new BadRequestException(
        'Can only cancel pending or paid orders',
      );
    }

    // 恢复库存：订单取消时恢复所有商品的库存
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const product = await this.getProductById(item.productId);

        // 恢复库存
        product.stockQuantity += item.quantity;

        // 恢复库存状态为正常
        if (product.stockQuantity > product.lowStockThreshold) {
          product.stockStatus = 'normal';
          product.isOutOfStock = false;
          product.isSoldOut = false;
        }

        await this.saveProduct(product);
      }
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

    order.status = 'paid';  // Status field tracks the full lifecycle: pending → paid → shipped → delivered
    order.paidAt = new Date();  // Record exact time of payment confirmation

    return await this.orderRepository.save(order);
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNo: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderNo: orderNo },
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
   * Admin: Get all orders with pagination (includes user information)
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
      relations: ['user'],
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
   * Admin: Get orders by status (includes user information)
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
      relations: ['user'],
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
   * Admin: Get order by ID (no user check, includes user information)
   */
  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      relations: ['user'],
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

  /**
   * Admin: Delete order (hard delete)
   */
  async remove(orderId: number): Promise<void> {
    const order = await this.getOrderById(orderId);
    await this.orderRepository.remove(order);
  }

  /**
   * Helper: Get product by ID
   */
  private async getProductById(productId: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product ID ${productId} not found`);
    }

    return product;
  }

  /**
   * Helper: Save product
   */
  private async saveProduct(product: Product): Promise<Product> {
    return await this.productRepository.save(product);
  }

  /**
   * 定时任务: 每分钟检查一次并自动取消超时的pending订单
   * 订单在创建后30分钟内如果未支付，将被自动取消
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async cancelExpiredPendingOrders(): Promise<void> {
    try {
      const now = new Date();
      const timeoutThreshold = new Date(
        now.getTime() - this.ORDER_TIMEOUT_MINUTES * 60 * 1000,
      );

      // 查询所有超时的pending订单
      const expiredOrders = await this.orderRepository.find({
        where: {
          status: 'pending',
          createdAt: LessThan(timeoutThreshold),
        },
        relations: ['items'],
      });

      if (expiredOrders.length === 0) {
        return;
      }

      this.logger.log(
        `[定时任务] 发现 ${expiredOrders.length} 个超时未支付的订单，开始取消...`,
      );

      // 逐个取消订单并恢复库存
      let cancelledCount = 0;
      let errorCount = 0;

      for (const order of expiredOrders) {
        try {
          await this.cancelExpiredOrder(order);
          cancelledCount++;
          this.logger.log(
            `[定时任务] 已取消超时订单 #${order.id} (orderId: ${order.orderNo})，库存已恢复`,
          );
        } catch (error) {
          errorCount++;
          this.logger.error(
            `[定时任务] 取消订单 #${order.id} 失败: ${error.message}`,
          );
        }
      }

      this.logger.log(
        `[定时任务] 超时订单处理完成: 成功取消 ${cancelledCount} 个, 失败 ${errorCount} 个`,
      );
    } catch (error) {
      this.logger.error(`[定时任务] 自动取消超时订单时出错: ${error.message}`);
    }
  }

  /**
   * 取消过期的订单并恢复库存
   * @param order 要取消的订单
   */
  private async cancelExpiredOrder(order: Order): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 恢复库存
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: item.productId },
          });

          if (product) {
            product.stockQuantity += item.quantity;

            // 恢复库存状态
            if (product.stockQuantity > product.lowStockThreshold) {
              product.stockStatus = 'normal';
              product.isOutOfStock = false;
              product.isSoldOut = false;
            }

            await queryRunner.manager.save(Product, product);
          }
        }
      }

      // 更新订单状态
      order.status = 'cancelled';
      await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`取消订单失败: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
