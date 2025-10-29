import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Entities
import { WechatPaymentEntity } from './entities/wechat-payment.entity';
import { WechatNotificationEntity } from './entities/wechat-notification.entity';

// Services
import { WechatPaymentService } from './services/wechat-payment.service';
import { WechatNotificationService } from './services/wechat-notification.service';

// Controllers
import { WechatPaymentController } from './controllers/wechat-payment.controller';
import { WechatNotificationController } from './controllers/wechat-notification.controller';

/**
 * 微信集成模块
 *
 * 功能范围：
 * 1. 微信支付集成
 *    - 统一下单（JSAPI/Native/H5支付）
 *    - 支付回调处理（含签名验证）
 *    - 订单查询
 *    - 退款申请
 *
 * 2. 微信推送通知
 *    - 发送订阅消息（推荐方式）
 *    - 发送模板消息（已逐步停用）
 *    - 批量发送通知
 *    - 通知记录查询和管理
 *
 * 3. 微信登录（已在auth模块实现）
 *    - 微信openId登录
 *    - 微信手机号授权登录
 *
 * 数据库表：
 * - wechat_payments: 支付订单记录表
 * - wechat_notifications: 推送通知记录表
 *
 * API路由：
 * - POST /api/wechat/payment/create-order - 创建支付订单
 * - POST /api/wechat/payment/callback - 支付回调处理（微信主动调用）
 * - GET /api/wechat/payment/query-status - 查询订单状态
 * - POST /api/wechat/payment/refund - 申请退款
 * - POST /api/wechat/notify/send-subscribe - 发送订阅消息
 * - POST /api/wechat/notify/send-batch - 批量发送通知
 * - GET /api/wechat/notify/records - 查询通知记录
 * - PUT /api/wechat/notify/mark-read/:id - 标记通知为已读
 * - POST /api/wechat/notify/retry-failed/:id - 重试失败的通知
 *
 * 环境变量配置（需要在.env中设置）：
 * - WECHAT_APP_ID: 微信小程序AppID
 * - WECHAT_APP_SECRET: 微信小程序AppSecret
 * - WECHAT_MCH_ID: 微信支付商户ID
 * - WECHAT_MCH_KEY: 微信支付API密钥
 * - WECHAT_PAY_NOTIFY_URL: 支付回调通知URL（必须是公网可访问）
 *
 * 使用示例：
 *
 * 1. 微信支付流程：
 *    - 小程序调用 POST /api/wechat/payment/create-order 创建订单
 *    - 后端返回支付参数（prepayId, sign等）
 *    - 小程序调用 wx.requestPayment() 发起支付
 *    - 用户完成支付后，微信服务器通知 POST /api/wechat/payment/callback
 *    - 后端验证回调并更新订单状态
 *    - 小程序轮询查询 GET /api/wechat/payment/query-status 确认支付状态
 *
 * 2. 发送通知流程：
 *    - 业务系统调用 POST /api/wechat/notify/send-subscribe 发送通知
 *    - 后端获取access_token并调用微信API
 *    - 微信发送通知给用户
 *    - 通知记录保存到数据库
 *
 * 3. 批量发送通知流程：
 *    - 业务系统调用 POST /api/wechat/notify/send-batch
 *    - 后端自动并发发送通知（并发限制为10）
 *    - 返回详细的发送统计结果
 */
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([WechatPaymentEntity, WechatNotificationEntity]),
  ],
  providers: [WechatPaymentService, WechatNotificationService],
  controllers: [WechatPaymentController, WechatNotificationController],
  exports: [WechatPaymentService, WechatNotificationService],
})
export class WechatModule {}
