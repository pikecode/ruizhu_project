import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  /**
   * Create a new order
   */
  async create(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create({
      userId,
      ...createOrderDto,
      status: OrderStatus.PENDING,
    });

    return this.orderRepository.save(order);
  }

  /**
   * Get all orders
   */
  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Get orders by user ID
   */
  async findByUserId(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Get a single order by ID
   */
  async findOne(id: number): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  /**
   * Update order status
   */
  async updateStatus(id: number, status: OrderStatus): Promise<Order | null> {
    await this.orderRepository.update(id, { status });
    return this.findOne(id);
  }

  /**
   * Delete an order
   */
  async remove(id: number): Promise<void> {
    await this.orderRepository.delete(id);
  }

  /**
   * Get order statistics for a user
   */
  async getUserOrderStats(userId: number) {
    const orders = await this.findByUserId(userId);
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.totalPrice.toString()), 0);
    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
    const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED).length;

    return {
      totalOrders,
      totalSpent,
      pendingOrders,
      deliveredOrders,
    };
  }
}
