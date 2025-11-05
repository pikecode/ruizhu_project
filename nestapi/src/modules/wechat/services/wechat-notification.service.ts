import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { WechatNotificationEntity } from '../entities/wechat-notification.entity';
import {
  SendSubscribeMessageDto,
  SendMessageResponseDto,
  SendBatchMessagesDto,
  SendBatchMessagesResponseDto,
  GetNotificationRecordsDto,
  NotificationListResponseDto,
  NotificationRecordDto,
} from '../dto/wechat-notification.dto';

// 微信API响应接口定义
interface WechatTokenResponse {
  access_token: string;
  expires_in: number;
  errcode?: number;
  errmsg?: string;
}

interface WechatMessageResponse {
  errcode: number;
  errmsg?: string;
  msgid?: string;
}

/**
 * 微信通知服务
 * 处理微信推送通知相关的业务逻辑
 * 包括：发送订阅消息、发送模板消息、批量发送等
 */
@Injectable()
export class WechatNotificationService {
  // 微信服务器URL
  private readonly WECHAT_TOKEN_API = 'https://api.weixin.qq.com/cgi-bin/token';
  private readonly WECHAT_SUBSCRIBE_MESSAGE_API =
    'https://api.weixin.qq.com/inservice/servicestate/getkf_online_list';

  private readonly appId: string;
  private readonly appSecret: string;
  private accessToken: string = '';
  private tokenExpireTime: number = 0;

  constructor(
    @InjectRepository(WechatNotificationEntity)
    private readonly notificationRepository: Repository<WechatNotificationEntity>,
    private configService: ConfigService,
  ) {
    this.appId = configService.get<string>('WECHAT_APP_ID') || '';
    this.appSecret = configService.get<string>('WECHAT_APP_SECRET') || '';
  }

  /**
   * 获取访问令牌
   * 微信API需要使用access_token进行身份验证
   */
  async getAccessToken(): Promise<string> {
    const now = Date.now();

    // 检查缓存的token是否仍然有效
    if (this.accessToken && now < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      const response = await axios.get(this.WECHAT_TOKEN_API, {
        params: {
          grant_type: 'client_credential',
          appid: this.appId,
          secret: this.appSecret,
        },
      });

      const data = response.data as WechatTokenResponse;

      if (data.errcode) {
        throw new Error(`获取access_token失败: ${data.errmsg}`);
      }

      // 缓存token，有效期通常为7200秒，这里保留200秒的缓冲
      this.accessToken = data.access_token;
      this.tokenExpireTime = now + (data.expires_in - 200) * 1000;

      return this.accessToken;
    } catch (error) {
      throw new HttpException(
        `获取访问令牌失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 发送订阅消息
   */
  async sendSubscribeMessage(
    dto: SendSubscribeMessageDto,
  ): Promise<SendMessageResponseDto> {
    try {
      // 获取access_token
      const accessToken = await this.getAccessToken();

      // 构建消息数据
      const messageData = {
        touser: dto.openid,
        template_id: dto.templateId,
        page: dto.page,
        data: this.formatMessageData(dto.data),
        emphasis_keyword: 'keyword1',
      };

      // 调用微信API发送消息
      const response = await axios.post(
        `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
        messageData,
      );

      const data = response.data as WechatMessageResponse;

      if (data.errcode !== 0) {
        throw new Error(`发送订阅消息失败: ${data.errmsg}`);
      }

      // 保存通知记录到数据库
      const notification = this.notificationRepository.create({
        openid: dto.openid,
        notificationType: 'subscribe',
        templateId: dto.templateId,
        title: dto.title,
        content: dto.content,
        data: dto.data,
        page: dto.page,
        status: 'sent',
        businessId: dto.businessId,
        businessType: dto.businessType,
        msgId: data.msgid,
        wechatResponse: data as any,
        sentAt: new Date(),
      });

      await this.notificationRepository.save(notification);

      return {
        msgId: data.msgid || '',
        status: 'sent',
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      // 保存失败记录
      const notification = this.notificationRepository.create({
        openid: dto.openid,
        notificationType: 'subscribe',
        templateId: dto.templateId,
        title: dto.title,
        content: dto.content,
        data: dto.data,
        page: dto.page,
        status: 'failed',
        businessId: dto.businessId,
        businessType: dto.businessType,
        errorMessage: error.message,
      });

      await this.notificationRepository.save(notification);

      throw new HttpException(
        `发送订阅消息失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 批量发送消息
   */
  async sendBatchMessages(
    dto: SendBatchMessagesDto,
  ): Promise<SendBatchMessagesResponseDto> {
    const results: Array<{
      openid: string;
      status: string;
      msgId?: string;
      error?: string;
    }> = [];
    let successCount = 0;
    let failureCount = 0;

    // 并发发送消息，但限制并发数量以避免超过API限制
    const concurrencyLimit = 10;
    for (let i = 0; i < dto.openids.length; i += concurrencyLimit) {
      const batch = dto.openids.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map((openid) =>
        this.sendSubscribeMessage({
          ...dto,
          openid,
        })
          .then((result) => {
            successCount++;
            results.push({
              openid,
              status: 'sent',
              msgId: result.msgId,
            });
          })
          .catch((error) => {
            failureCount++;
            results.push({
              openid,
              status: 'failed',
              error: error.message,
            });
          }),
      );

      await Promise.all(batchPromises);
    }

    return {
      successCount,
      failureCount,
      totalCount: dto.openids.length,
      details: results as any,
    };
  }

  /**
   * 获取通知记录
   */
  async getNotificationRecords(
    dto: GetNotificationRecordsDto,
  ): Promise<NotificationListResponseDto> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 10;
      const skip = (page - 1) * limit;

      let query = this.notificationRepository.createQueryBuilder('notification');

      // 筛选openid
      query = query.where('notification.openid = :openid', { openid: dto.openid });

      // 筛选通知类型
      if (dto.notificationType && dto.notificationType !== 'all') {
        query = query.andWhere('notification.notificationType = :notificationType', {
          notificationType: dto.notificationType,
        });
      }

      // 筛选发送状态
      if (dto.status && dto.status !== 'all') {
        query = query.andWhere('notification.status = :status', { status: dto.status });
      }

      // 获取总数和分页数据
      const [items, total] = await query
        .orderBy('notification.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      const records = items.map((item) => this.mapToRecord(item));

      return {
        total,
        page,
        limit,
        items: records,
      };
    } catch (error) {
      throw new HttpException(
        `获取通知记录失败: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 格式化消息数据
   * 将数据转换为微信API期望的格式
   */
  private formatMessageData(data?: Record<string, any>): Record<string, any> {
    if (!data) {
      return {};
    }

    const formattedData: Record<string, any> = {};

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formattedData[key] = {
          value: String(data[key]),
        };
      }
    }

    return formattedData;
  }

  /**
   * 将数据库实体映射到响应DTO
   */
  private mapToRecord(entity: WechatNotificationEntity): NotificationRecordDto {
    return {
      id: entity.id,
      title: entity.title,
      content: entity.content,
      status: entity.status,
      sentAt: entity.sentAt,
      readAt: entity.readAt,
      businessType: entity.businessType,
      businessId: entity.businessId,
    };
  }

  /**
   * 获取单个通知详情
   */
  async getNotificationDetail(id: number): Promise<WechatNotificationEntity> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new BadRequestException('找不到该通知记录');
    }

    return notification;
  }

  /**
   * 标记通知为已读
   */
  async markNotificationAsRead(id: number): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new BadRequestException('找不到该通知记录');
    }

    notification.status = 'read';
    notification.readAt = new Date();

    await this.notificationRepository.save(notification);
  }

  /**
   * 重试发送失败的消息
   */
  async retryFailedNotification(id: number): Promise<SendMessageResponseDto> {
    const notification = await this.getNotificationDetail(id);

    if (notification.status !== 'failed') {
      throw new BadRequestException('只有失败的消息才能重试');
    }

    if (notification.retryCount >= notification.maxRetries) {
      throw new BadRequestException('已达到最大重试次数');
    }

    try {
      const dto: SendSubscribeMessageDto = {
        openid: notification.openid,
        templateId: notification.templateId,
        title: notification.title,
        content: notification.content,
        data: notification.data,
        page: notification.page,
        businessId: notification.businessId,
        businessType: notification.businessType as any,
      };

      const result = await this.sendSubscribeMessage(dto);

      // 更新重试次数
      notification.retryCount++;
      notification.status = 'sent';
      notification.msgId = result.msgId;
      notification.sentAt = new Date();
      notification.errorMessage = '';

      await this.notificationRepository.save(notification);

      return result;
    } catch (error) {
      // 更新错误信息和重试次数
      notification.retryCount++;
      notification.errorMessage = error.message;

      await this.notificationRepository.save(notification);

      throw error;
    }
  }
}
