import { IsString, IsNotEmpty, IsOptional, IsEnum, IsJSON } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 发送模板消息请求 DTO
 * 用于发送微信推送通知模板消息
 * @deprecated 微信已逐步停用模板消息，建议使用订阅消息
 */
export class SendTemplateMessageDto {
  @ApiProperty({
    description: '用户openId',
    example: 'oT8sGv0dAZWqB5jq7V_d-RM34xY8',
  })
  @IsString()
  @IsNotEmpty()
  openid: string;

  @ApiProperty({
    description: '模板ID',
    example: 'ngcharlesme_4jb74tVwW4gC4c6DpWMvjqxQg-fXsWvKJ3NVLLzGAy0',
  })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({
    description: '消息标题',
    example: '订单支付成功',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '模板数据，JSON格式',
    example: {
      first: { value: '订单号：123456' },
      keyword1: { value: '¥100.00' },
      keyword2: { value: '2023-12-25 10:00:00' },
      remark: { value: '点击查看订单详情' },
    },
  })
  @IsOptional()
  data?: Record<string, any>;

  @ApiProperty({
    description: '点击消息跳转的页面',
    example: '/pages/order/detail?id=123',
    required: false,
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: '业务ID（订单ID等）',
    example: '123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  businessId?: string;

  @ApiProperty({
    description: '业务类型',
    example: 'order',
    required: false,
  })
  @IsString()
  @IsOptional()
  businessType?: string;
}

/**
 * 发送订阅消息请求 DTO
 * 用于发送微信订阅通知消息（推荐）
 */
export class SendSubscribeMessageDto {
  @ApiProperty({
    description: '用户openId',
    example: 'oT8sGv0dAZWqB5jq7V_d-RM34xY8',
  })
  @IsString()
  @IsNotEmpty()
  openid: string;

  @ApiProperty({
    description: '订阅消息模板ID',
    example: '_xW4gC4c6DpWMvjqxQg-fXsWvKJ3NVLLzGAy0',
  })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({
    description: '消息标题',
    example: '订单支付成功',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '消息内容',
    example: '您的订单已支付成功，感谢您的购买',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: '消息数据，JSON格式',
    example: {
      thing1: { value: '订单号123456' },
      amount2: { value: '¥100.00' },
      time3: { value: '2023-12-25 10:00:00' },
    },
  })
  @IsOptional()
  data?: Record<string, any>;

  @ApiProperty({
    description: '点击消息跳转的页面路径',
    example: '/pages/order/detail?id=123',
  })
  @IsString()
  @IsNotEmpty()
  page: string;

  @ApiProperty({
    description: '跳转小程序的appid',
    example: 'wx0377b6b22ea7e8fc',
    required: false,
  })
  @IsString()
  @IsOptional()
  appid?: string;

  @ApiProperty({
    description: '业务ID（订单ID等）',
    example: '123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  businessId?: string;

  @ApiProperty({
    description: '业务类型',
    enum: ['order', 'payment', 'refund', 'delivery', 'system'],
    example: 'order',
    required: false,
  })
  @IsString()
  @IsOptional()
  businessType?: string;

  @ApiProperty({
    description: '是否立即发送，false表示定时发送',
    example: true,
    required: false,
  })
  @IsOptional()
  immediate?: boolean;

  @ApiProperty({
    description: '定时发送时间（ISO 8601格式）',
    example: '2023-12-25T15:00:00Z',
    required: false,
  })
  @IsString()
  @IsOptional()
  scheduledAt?: string;
}

/**
 * 推送消息响应 DTO
 */
export class SendMessageResponseDto {
  @ApiProperty({
    description: '消息ID',
    example: '1234567890',
  })
  msgId: string;

  @ApiProperty({
    description: '发送状态',
    enum: ['pending', 'sent', 'failed'],
    example: 'sent',
  })
  status: 'pending' | 'sent' | 'failed';

  @ApiProperty({
    description: '错误信息（仅当发送失败时返回）',
    example: 'The template_id is invalid',
    required: false,
  })
  errorMessage?: string;

  @ApiProperty({
    description: '发送时间',
    example: '2023-12-25T10:00:00Z',
  })
  sentAt: string;
}

/**
 * 批量发送消息请求 DTO
 */
export class SendBatchMessagesDto {
  @ApiProperty({
    description: '用户openId列表',
    example: ['oT8sGv0dAZWqB5jq7V_d-RM34xY8', 'oX8sGv0dAZWqB5jq7V_d-RM34xY9'],
  })
  @IsNotEmpty()
  openids: string[];

  @ApiProperty({
    description: '订阅消息模板ID',
    example: '_xW4gC4c6DpWMvjqxQg-fXsWvKJ3NVLLzGAy0',
  })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({
    description: '消息标题',
    example: '订单支付成功',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '消息内容',
    example: '您的订单已支付成功',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: '消息数据模板',
    example: {
      thing1: { value: '订单号{{orderId}}' },
      amount2: { value: '¥{{amount}}' },
    },
  })
  @IsOptional()
  data?: Record<string, any>;

  @ApiProperty({
    description: '点击消息跳转的页面路径',
    example: '/pages/order/list',
  })
  @IsString()
  @IsNotEmpty()
  page: string;

  @ApiProperty({
    description: '业务类型',
    enum: ['order', 'payment', 'refund', 'delivery', 'system'],
    example: 'order',
    required: false,
  })
  @IsString()
  @IsOptional()
  businessType?: string;
}

/**
 * 批量发送消息响应 DTO
 */
export class SendBatchMessagesResponseDto {
  @ApiProperty({
    description: '成功发送的消息数',
    example: 95,
  })
  successCount: number;

  @ApiProperty({
    description: '发送失败的消息数',
    example: 5,
  })
  failureCount: number;

  @ApiProperty({
    description: '总消息数',
    example: 100,
  })
  totalCount: number;

  @ApiProperty({
    description: '消息发送详情',
    example: [
      { openid: 'oT8sGv0dAZWqB5jq7V_d-RM34xY8', status: 'sent', msgId: '123456' },
      { openid: 'oX8sGv0dAZWqB5jq7V_d-RM34xY9', status: 'failed', error: 'Invalid template' },
    ],
  })
  details?: Array<{
    openid: string;
    status: 'sent' | 'failed';
    msgId?: string;
    error?: string;
  }>;
}

/**
 * 获取消息发送记录请求 DTO
 */
export class GetNotificationRecordsDto {
  @ApiProperty({
    description: '用户openId',
    example: 'oT8sGv0dAZWqB5jq7V_d-RM34xY8',
  })
  @IsString()
  @IsNotEmpty()
  openid: string;

  @ApiProperty({
    description: '通知类型筛选',
    enum: ['template', 'subscribe', 'uniform', 'all'],
    example: 'subscribe',
    required: false,
  })
  @IsEnum(['template', 'subscribe', 'uniform', 'all'])
  @IsOptional()
  notificationType?: 'template' | 'subscribe' | 'uniform' | 'all';

  @ApiProperty({
    description: '发送状态筛选',
    enum: ['pending', 'sent', 'failed', 'read', 'all'],
    example: 'sent',
    required: false,
  })
  @IsEnum(['pending', 'sent', 'failed', 'read', 'all'])
  @IsOptional()
  status?: 'pending' | 'sent' | 'failed' | 'read' | 'all';

  @ApiProperty({
    description: '页码',
    example: 1,
    required: false,
  })
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: '每页数量',
    example: 10,
    required: false,
  })
  @IsOptional()
  limit?: number;
}

/**
 * 通知记录响应 DTO
 */
export class NotificationRecordDto {
  @ApiProperty({
    description: '记录ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '消息标题',
    example: '订单支付成功',
  })
  title: string;

  @ApiProperty({
    description: '消息内容',
    example: '您的订单已支付成功',
  })
  content: string;

  @ApiProperty({
    description: '发送状态',
    enum: ['pending', 'sent', 'failed', 'read'],
  })
  status: string;

  @ApiProperty({
    description: '发送时间',
    example: '2023-12-25T10:00:00Z',
  })
  sentAt: Date;

  @ApiProperty({
    description: '读取时间',
    example: '2023-12-25T10:05:00Z',
    required: false,
  })
  readAt?: Date;

  @ApiProperty({
    description: '业务类型',
    example: 'order',
  })
  businessType?: string;

  @ApiProperty({
    description: '业务ID',
    example: '123456',
  })
  businessId?: string;
}

/**
 * 获取消息记录列表响应 DTO
 */
export class NotificationListResponseDto {
  @ApiProperty({
    description: '总记录数',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: '当前页码',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '每页数量',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: '消息记录列表',
    type: [NotificationRecordDto],
  })
  items: NotificationRecordDto[];
}
