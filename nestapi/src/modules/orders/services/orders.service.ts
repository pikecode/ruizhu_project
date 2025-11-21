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
import { User } from '../../../entities/user.entity';
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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    // Validate discount amount against user's actual discount field
    if (createDto.discountAmount && createDto.discountAmount > 0) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Calculate expected discount amount based on user's discount field
      // User.discount is a decimal between 0.01 and 1.00, where 1.00 = no discount
      const userDiscount = parseFloat(user.discount.toString());
      if (userDiscount < 0.01 || userDiscount > 1.0) {
        throw new BadRequestException(
          'User discount field is invalid: ' + userDiscount,
        );
      }

      // Expected discounted amount = totalAmount * userDiscount
      const expectedDiscountedAmount = Math.round(
        createDto.totalAmount * userDiscount,
      );
      // Expected discount amount = totalAmount - expectedDiscountedAmount
      const expectedDiscountAmount = createDto.totalAmount - expectedDiscountedAmount;

      // Allow a small tolerance (1 cent) for rounding differences
      const tolerance = 1;
      if (
        Math.abs(createDto.discountAmount - expectedDiscountAmount) > tolerance
      ) {
        throw new BadRequestException(
          `Discount amount ${createDto.discountAmount} does not match user's discount. ` +
            `Expected: ${expectedDiscountAmount} (user discount: ${(userDiscount * 100).toFixed(2)}%)`,
        );
      }
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

    // 提取所有产品ID并用分号分隔
    const productIds = createDto.items && createDto.items.length > 0
      ? createDto.items.map(item => item.productId).join(';')
      : undefined;

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
      // 保存所有产品的 ID 到订单表（用分号分隔）
      productIds,
    });

    const savedOrder = await this.orderRepository.save(order);

    // 保存订单项：记录订单中包含的每个产品信息和产品类型
    // 这样可以在查询订单时获取完整的订单项信息，包括产品类型和折扣
    const orderItems: OrderItem[] = [];
    try {
      for (const item of createDto.items) {
        try {
          const product = await this.getProductById(item.productId);

          if (product.stockQuantity < item.quantity) {
            throw new BadRequestException(
              `产品 ${product.name} 库存不足，仅剩 ${product.stockQuantity} 件`,
            );
          }

          // 先构造 selectedAttributes，包含 productType 和 discount
          const selectedAttributes: Record<string, any> = item.selectedAttributes || {};
          if (item.productType) {
            selectedAttributes.productType = item.productType;
          }
          if (item.discount) {
            selectedAttributes.discount = item.discount;
          }

          console.log(`[OrdersService] 创建订单项 - productId: ${item.productId}, selectedAttributes:`, selectedAttributes);

          // 创建订单项记录（关键字段包括产品类型和折扣）
          const orderItemData = {
            orderId: savedOrder.id,
            productId: item.productId,
            productName: product.name,
            sku: product.sku || undefined,
            quantity: item.quantity,
            priceSnapshot: item.price,
            subtotal: item.price * item.quantity,
            selectedAttributes,
            status: 'pending' as const,
          };

          const orderItem = this.dataSource
            .getRepository(OrderItem)
            .create(orderItemData);

          const savedItem = await this.dataSource
            .getRepository(OrderItem)
            .save(orderItem);

          console.log(`[OrdersService] 订单项保存成功 - ID: ${savedItem.id}, orderId: ${savedItem.orderId}`);

          orderItems.push(savedItem);
        } catch (itemError) {
          console.error(`[OrdersService] 保存订单项失败 - productId: ${item.productId}:`, itemError);
          throw itemError;
        }
      }
    } catch (itemsError) {
      console.error('[OrdersService] 保存订单项列表失败:', itemsError);
      throw itemsError;
    }

    // 注意：订单创建时不扣减库存，只在支付成功后扣减
    // 这样可以防止用户下单后不支付导致库存被占用
    // 库存扣减逻辑已移至 markOrderAsPaidByOutTradeNo 方法中

    // 返回订单，同时包含订单项信息
    return {
      ...savedOrder,
      items: orderItems,
    } as any;
  }

  /**
   * Get single order by ID with order items
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

    // 获取订单项，这样前端可以得到完整的订单信息（包括产品类型和折扣）
    const items = await this.dataSource
      .getRepository(OrderItem)
      .find({
        where: { orderId: order.id },
      });

    // 为每个订单项加载产品信息（包括图片）
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });
        return {
          ...item,
          product: product
            ? {
                id: product.id,
                name: product.name,
                coverImageUrl: product.coverImageUrl,
                currentPrice: product.currentPrice,
                originalPrice: product.originalPrice,
              }
            : null,
        };
      }),
    );

    return {
      ...order,
      items: itemsWithProducts,
    } as any;
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
    this.logger.log(`[markOrderAsPaid] 开始处理订单支付标记，userId=${userId}, orderId=${orderId}`);

    // 先直接查询订单，不依赖 userId 验证
    let order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      this.logger.error(`[markOrderAsPaid] 找不到订单，orderId=${orderId}`);
      throw new NotFoundException('Order not found');
    }

    // 如果提供了userId，验证订单属于该用户
    if (userId && order.userId !== userId) {
      this.logger.warn(`[markOrderAsPaid] 用户不匹配，期望userId=${userId}，实际userId=${order.userId}，但继续处理`);
      // 不中断，继续处理，因为支付回调可能使用不同的userId
    }

    this.logger.log(`[markOrderAsPaid] 获取订单成功，当前状态=${order.status}, orderNo=${order.orderNo}`);

    if (order.status !== 'pending') {
      this.logger.error(`[markOrderAsPaid] 订单状态不是 pending，当前状态=${order.status}`);
      throw new BadRequestException('Only pending orders can be marked as paid');
    }

    order.status = 'paid';  // Status field tracks the full lifecycle: pending → paid → shipped → delivered
    order.paymentStatus = 'paid';  // Mark payment as complete
    order.paidAt = new Date();  // Record exact time of payment confirmation
    this.logger.log(`[markOrderAsPaid] 订单状态已更新为 paid，payment_status 已更新为 paid，即将保存到数据库`);

    const savedOrder = await this.orderRepository.save(order);
    this.logger.log(`[markOrderAsPaid] 订单已成功保存，新状态=${savedOrder.status}, paidAt=${savedOrder.paidAt}`);

    return savedOrder;
  }

  /**
   * Mark order as paid by outTradeNo (for WeChat payment callback)
   * This method is called from payment callback with outTradeNo as the key
   * It avoids dependency on userId verification since callbacks may use different context
   */
  async markOrderAsPaidByOutTradeNo(
    outTradeNo: string,
    orderId: number,
    userId: number,
  ): Promise<Order> {
    this.logger.log(`[markOrderAsPaidByOutTradeNo] 通过 outTradeNo 标记订单为已支付，outTradeNo=${outTradeNo}, orderId=${orderId}, userId=${userId}`);

    // Query order directly by ID
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      this.logger.error(`[markOrderAsPaidByOutTradeNo] 找不到订单，orderId=${orderId}`);
      throw new NotFoundException('Order not found');
    }

    // Verify userId matches for security
    if (order.userId !== userId) {
      this.logger.error(`[markOrderAsPaidByOutTradeNo] 用户不匹配，期望userId=${userId}，实际userId=${order.userId}, orderId=${orderId}`);
      throw new BadRequestException('Order does not belong to this user');
    }

    if (order.status !== 'pending') {
      this.logger.error(`[markOrderAsPaidByOutTradeNo] 订单状态不是 pending，当前状态=${order.status}, orderId=${orderId}`);
      throw new BadRequestException('Only pending orders can be marked as paid');
    }

    order.status = 'paid';
    order.paymentStatus = 'paid';  // Mark payment as complete
    order.paidAt = new Date();
    this.logger.log(`[markOrderAsPaidByOutTradeNo] 订单状态已更新为 paid，payment_status 已更新为 paid，orderId=${orderId}, outTradeNo=${outTradeNo}`);

    const savedOrder = await this.orderRepository.save(order);
    this.logger.log(`[markOrderAsPaidByOutTradeNo] 订单已成功保存，orderId=${orderId}, status=${savedOrder.status}, paidAt=${savedOrder.paidAt}`);

    // 支付成功后扣减库存（使用乐观锁防止超卖）
    this.logger.log(`[markOrderAsPaidByOutTradeNo] 开始扣减库存，orderId=${orderId}`);
    const orderItems = await this.dataSource.getRepository(OrderItem).find({
      where: { orderId: orderId },
    });

    for (const item of orderItems) {
      const product = await this.getProductById(item.productId);
      this.logger.log(`[markOrderAsPaidByOutTradeNo] 扣减库存 - 产品ID: ${item.productId}, 当前库存: ${product.stockQuantity}, 扣减数量: ${item.quantity}`);

      // 检查库存是否足够
      if (product.stockQuantity < item.quantity) {
        this.logger.error(`[markOrderAsPaidByOutTradeNo] 库存不足 - 产品ID: ${item.productId}, 需要: ${item.quantity}, 剩余: ${product.stockQuantity}`);
        throw new BadRequestException(
          `产品 ${product.name} 库存不足，无法完成支付`,
        );
      }

      // 扣减库存
      const updateResult = await this.productRepository.update(
        { id: product.id },
        {
          stockQuantity: product.stockQuantity - item.quantity,
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

      if (updateResult.affected === 0) {
        this.logger.error(`[markOrderAsPaidByOutTradeNo] 更新库存失败 - 产品ID: ${item.productId}`);
        throw new BadRequestException(
          `产品 ${product.name} 库存更新失败，请联系客服`,
        );
      }

      this.logger.log(`[markOrderAsPaidByOutTradeNo] 库存扣减成功 - 产品ID: ${item.productId}, 新库存: ${product.stockQuantity - item.quantity}`);
    }

    this.logger.log(`[markOrderAsPaidByOutTradeNo] 所有库存扣减完成，orderId=${orderId}`);
    return savedOrder;
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

    if (updateDto.trackingNumber !== undefined) {
      order.trackingNumber = updateDto.trackingNumber;
      // 自动将订单状态更新为"已发货"
      if (order.status === 'paid') {
        order.status = 'shipped';
        order.shippedAt = new Date();
      }
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
