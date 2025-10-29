import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * 微信支付订单实体
 * 存储所有通过微信支付生成的订单信息
 */
@Entity('wechat_payments')
@Index(['openid'])
@Index(['outTradeNo'])
@Index(['prepayId'])
@Index(['transactionId'])
export class WechatPaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 用户openId - 微信小程序用户唯一标识
   */
  @Column({ type: 'varchar', length: 100 })
  openid: string;

  /**
   * 商户订单号 - 商家侧的订单编号
   * 需要在商户系统中唯一
   */
  @Column({ type: 'varchar', length: 100, unique: true })
  outTradeNo: string;

  /**
   * 微信支付订单号 - 微信返回的交易号
   * 支付成功后由微信返回
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionId: string;

  /**
   * 预支付交易会话标识
   * 调用微信统一下单API返回
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  prepayId: string;

  /**
   * 支付金额（分）
   */
  @Column({ type: 'int' })
  totalFee: number;

  /**
   * 订单标题/商品描述
   */
  @Column({ type: 'varchar', length: 255 })
  body: string;

  /**
   * 订单详情
   */
  @Column({ type: 'text', nullable: true })
  detail: string;

  /**
   * 回调通知的URL
   * 支付成功时微信服务器会通知该地址
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  notifyUrl: string;

  /**
   * 支付状态
   * 'pending': 待支付
   * 'success': 支付成功
   * 'failed': 支付失败
   * 'cancelled': 已取消
   */
  @Column({ type: 'enum', enum: ['pending', 'success', 'failed', 'cancelled'], default: 'pending' })
  status: 'pending' | 'success' | 'failed' | 'cancelled';

  /**
   * 支付完成时间
   */
  @Column({ type: 'datetime', nullable: true })
  payTime: Date;

  /**
   * 业务数据
   * JSON格式存储相关的业务数据（如订单ID、订单类型等）
   */
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  /**
   * 支付方式
   * 'balance': 余额支付
   * 'wechat': 微信支付
   * 'alipay': 支付宝
   */
  @Column({ type: 'varchar', length: 50, default: 'wechat' })
  paymentMethod: string;

  /**
   * 微信回调数据
   * 存储微信服务器返回的完整回调信息
   */
  @Column({ type: 'json', nullable: true })
  wechatCallback: Record<string, any>;

  /**
   * 备注
   */
  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
