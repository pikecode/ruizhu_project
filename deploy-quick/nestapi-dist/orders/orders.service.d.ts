import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersService {
    private orderRepository;
    constructor(orderRepository: Repository<Order>);
    create(userId: number, createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(): Promise<Order[]>;
    findByUserId(userId: number): Promise<Order[]>;
    findOne(id: number): Promise<Order | null>;
    updateStatus(id: number, status: OrderStatus): Promise<Order | null>;
    remove(id: number): Promise<void>;
    getUserOrderStats(userId: number): unknown;
}
