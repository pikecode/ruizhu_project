import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './entities/order.entity';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(user: any, createOrderDto: CreateOrderDto): unknown;
    findAll(): unknown;
    getUserOrders(user: any): unknown;
    getUserStats(user: any): unknown;
    findOne(id: string): unknown;
    updateStatus(id: string, status: OrderStatus): unknown;
    remove(id: string): unknown;
}
