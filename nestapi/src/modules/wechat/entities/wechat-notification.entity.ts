import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * 微信通知记录实体
 * 存储所有发送给用户的微信模板消息和订阅消息
 */
@Entity('wechat_notifications')
@Index(['openid'])
@Index(['status'])
@Index(['notificationType'])
export class WechatNotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 用户openId - 微信小程序用户唯一标识
   */
  @Column({ type: 'varchar', length: 100 })
  openid: string;

  /**
   * 通知类型
   * 'template': 模板消息 (已逐步停用)
   * 'subscribe': 订阅消息 (推荐使用)
   * 'uniform': 统一服务消息
   */
  @Column({ type: 'enum', enum: ['template', 'subscribe', 'uniform'], default: 'subscribe' })
  notificationType: 'template' | 'subscribe' | 'uniform';

  /**
   * 模板ID/消息ID
   * 对于模板消息：template_id
   * 对于订阅消息：msg_template_id
   */
  @Column({ type: 'varchar', length: 100 })
  templateId: string;

  /**
   * 消息标题
   */
  @Column({ type: 'varchar', length: 255 })
  title: string;

  /**
   * 消息内容
   */
  @Column({ type: 'text' })
  content: string;

  /**
   * 消息数据
   * JSON格式，包含模板变量值
   */
  @Column({ type: 'json', nullable: true })
  data: Record<string, any>;

  /**
   * 点击消息跳转的页面/路径
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  page: string;

  /**
   * 发送状态
   * 'pending': 待发送
   * 'sent': 已发送
   * 'failed': 发送失败
   * 'read': 用户已读
   */
  @Column({ type: 'enum', enum: ['pending', 'sent', 'failed', 'read'], default: 'pending' })
  status: 'pending' | 'sent' | 'failed' | 'read';

  /**
   * 关联的业务ID
   * 如订单ID、支付ID等
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  businessId: string;

  /**
   * 业务类型
   * 'order': 订单相关
   * 'payment': 支付相关
   * 'refund': 退款相关
   * 'delivery': 发货相关
   * 'system': 系统通知
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  businessType: string;

  /**
   * 微信服务器返回的msg_id
   * 用于后续消息状态查询
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  msgId: string;

  /**
   * 微信服务器的响应信息
   * JSON格式存储完整的API响应
   */
  @Column({ type: 'json', nullable: true })
  wechatResponse: Record<string, any>;

  /**
   * 发送失败原因
   */
  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  /**
   * 发送时间
   */
  @Column({ type: 'datetime', nullable: true })
  sentAt: Date;

  /**
   * 计划发送时间
   * 如果为NULL表示立即发送
   */
  @Column({ type: 'datetime', nullable: true })
  scheduledAt: Date;

  /**
   * 用户读取时间
   */
  @Column({ type: 'datetime', nullable: true })
  readAt: Date;

  /**
   * 重试次数
   */
  @Column({ type: 'int', default: 0 })
  retryCount: number;

  /**
   * 最多重试次数
   */
  @Column({ type: 'int', default: 3 })
  maxRetries: number;

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
