import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';

export enum PaymentStatus {
  PENDING = 'pending',        // 待支付
  PROCESSING = 'processing',  // 处理中
  SUCCESS = 'success',        // 支付成功
  FAILED = 'failed',          // 支付失败
  CANCELLED = 'cancelled',    // 已取消
  REFUNDED = 'refunded',      // 已退款
}

export enum PaymentMethod {
  WECHAT = 'wechat',          // 微信支付
  ALIPAY = 'alipay',          // 支付宝
  CARD = 'card',              // 银行卡
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  transactionNo: string; // 商户交易流水号

  @Column({ type: 'varchar', length: 64, nullable: true })
  wechatTransactionId: string; // 微信支付交易号

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int' })
  orderId: number;

  @OneToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number; // 支付金额（分）

  @Column({ type: 'varchar', length: 20, default: PaymentMethod.WECHAT })
  paymentMethod: PaymentMethod;

  @Column({ type: 'varchar', length: 20, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  // WeChat 相关
  @Column({ type: 'varchar', length: 255, nullable: true })
  prepayId: string; // 微信预支付ID

  @Column({ type: 'text', nullable: true })
  wechatResponse: string; // 微信支付返回的响应数据

  @Column({ type: 'text', nullable: true })
  callbackData: string; // 支付回调数据

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date; // 支付完成时间

  @Column({ type: 'text', nullable: true })
  failureReason: string; // 失败原因

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
