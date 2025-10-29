import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { WechatNotificationService } from '../services/wechat-notification.service';
import {
  SendSubscribeMessageDto,
  SendMessageResponseDto,
  SendBatchMessagesDto,
  SendBatchMessagesResponseDto,
  GetNotificationRecordsDto,
  NotificationListResponseDto,
  NotificationRecordDto,
} from '../dto/wechat-notification.dto';

/**
 * 微信通知控制器
 * 处理所有与微信推送通知相关的API请求
 */
@ApiTags('WeChat Notification')
@Controller('wechat/notify')
export class WechatNotificationController {
  private readonly logger = new Logger(WechatNotificationController.name);

  constructor(private readonly notificationService: WechatNotificationService) {}

  /**
   * 发送订阅消息
   *
   * 订阅消息使用场景：
   * - 订单支付成功通知
   * - 订单发货通知
   * - 退款成功通知
   * - 重要的系统通知
   *
   * 用户需要主动授权才能接收订阅消息
   * 每个模板ID都对应一种消息类型
   */
  @Post('send-subscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send WeChat subscription message',
    description:
      'Send a subscription notification to a user. User must authorize this message type.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification sent successfully',
    type: SendMessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request parameters or WeChat API error',
  })
  async sendSubscribeMessage(
    @Body() sendMessageDto: SendSubscribeMessageDto,
  ): Promise<{ code: number; message: string; data: SendMessageResponseDto }> {
    this.logger.log(
      `Sending subscription message to ${sendMessageDto.openid}, template: ${sendMessageDto.templateId}`,
    );

    const data = await this.notificationService.sendSubscribeMessage(
      sendMessageDto,
    );

    return {
      code: 200,
      message: 'Notification sent successfully',
      data,
    };
  }

  /**
   * 批量发送通知
   * 用于同时向多个用户发送相同内容的通知
   *
   * 特点：
   * - 支持并发发送，自动限制并发数以避免超过API限制
   * - 返回详细的发送结果统计
   * - 支持失败重试（通过后续的重试接口）
   */
  @Post('send-batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send batch notifications',
    description: 'Send the same notification to multiple users. Concurrent sending with automatic limiting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch notifications sent',
    type: SendBatchMessagesResponseDto,
  })
  async sendBatchMessages(
    @Body() sendBatchDto: SendBatchMessagesDto,
  ): Promise<{ code: number; message: string; data: SendBatchMessagesResponseDto }> {
    this.logger.log(
      `Sending batch notifications to ${sendBatchDto.openids.length} users`,
    );

    const data = await this.notificationService.sendBatchMessages(sendBatchDto);

    return {
      code: 200,
      message: 'Batch notifications sent',
      data,
    };
  }

  /**
   * 获取通知记录
   * 查询用户的历史通知消息
   *
   * 支持筛选：
   * - 通知类型（订阅消息、模板消息等）
   * - 发送状态（已发送、失败、已读等）
   * - 分页查询
   */
  @Get('records')
  @ApiOperation({
    summary: 'Get notification records',
    description: 'Query user notification history with filtering and pagination',
  })
  @ApiQuery({
    name: 'openid',
    description: 'User openId',
    required: true,
  })
  @ApiQuery({
    name: 'notificationType',
    description: 'Filter by notification type: subscribe, template, uniform, all',
    required: false,
    enum: ['template', 'subscribe', 'uniform', 'all'],
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by status: pending, sent, failed, read, all',
    required: false,
    enum: ['pending', 'sent', 'failed', 'read', 'all'],
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Notification records retrieved',
    type: NotificationListResponseDto,
  })
  async getNotificationRecords(
    @Query() getRecordsDto: GetNotificationRecordsDto,
  ): Promise<{ code: number; message: string; data: NotificationListResponseDto }> {
    const data = await this.notificationService.getNotificationRecords(
      getRecordsDto,
    );

    return {
      code: 200,
      message: 'Notification records retrieved',
      data,
    };
  }

  /**
   * 标记通知为已读
   * 用于更新通知的读取状态
   */
  @Put('mark-read/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Update notification status to read',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
  })
  async markNotificationAsRead(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ code: number; message: string }> {
    await this.notificationService.markNotificationAsRead(id);

    return {
      code: 200,
      message: 'Notification marked as read',
    };
  }

  /**
   * 重试发送失败的通知
   * 用于重新发送之前失败的通知消息
   *
   * 重试限制：
   * - 只能重试失败的消息
   * - 最多可重试的次数由配置决定（默认3次）
   * - 每次重试都会增加重试计数
   */
  @Post('retry-failed/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retry failed notification',
    description: 'Retry sending a failed notification message',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Notification retry sent',
    type: SendMessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Notification not found or cannot be retried',
  })
  async retryFailedNotification(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ code: number; message: string; data: SendMessageResponseDto }> {
    this.logger.log(`Retrying notification ${id}`);

    const data = await this.notificationService.retryFailedNotification(id);

    return {
      code: 200,
      message: 'Notification retry sent',
      data,
    };
  }
}
