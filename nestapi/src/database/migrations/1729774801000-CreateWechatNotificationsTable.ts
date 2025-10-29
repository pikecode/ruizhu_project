import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * 微信通知记录表迁移脚本
 * 创建 wechat_notifications 表用于存储发送给用户的微信推送通知
 *
 * 表结构说明：
 * - 支持多种通知类型：模板消息、订阅消息、统一服务消息
 * - 跟踪通知状态：待发送、已发送、失败、已读
 * - 支持批量重试机制，记录重试次数和最大重试次数
 * - 关联业务信息，支持按业务类型和ID查询
 * - JSON字段存储模板数据和微信API响应
 * - 创建索引提升查询性能
 */
export class CreateWechatNotificationsTable1729774801000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wechat_notifications',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'openid',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: '用户openId - 微信小程序用户唯一标识',
          },
          {
            name: 'notificationType',
            type: 'enum',
            enum: ['template', 'subscribe', 'uniform'],
            default: "'subscribe'",
            isNullable: false,
            comment: '通知类型：template(模板), subscribe(订阅), uniform(统一服务)',
          },
          {
            name: 'templateId',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: '模板ID/消息ID',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: '消息标题',
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
            comment: '消息内容',
          },
          {
            name: 'data',
            type: 'json',
            isNullable: true,
            comment: '消息数据 - JSON格式，包含模板变量值',
          },
          {
            name: 'page',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: '点击消息跳转的页面/路径',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'sent', 'failed', 'read'],
            default: "'pending'",
            isNullable: false,
            comment: '发送状态：pending(待发), sent(已发), failed(失败), read(已读)',
          },
          {
            name: 'businessId',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '关联的业务ID - 如订单ID、支付ID等',
          },
          {
            name: 'businessType',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment:
              '业务类型 - order(订单), payment(支付), refund(退款), delivery(发货), system(系统)',
          },
          {
            name: 'msgId',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '微信服务器返回的msg_id - 用于后续消息状态查询',
          },
          {
            name: 'wechatResponse',
            type: 'json',
            isNullable: true,
            comment: '微信服务器的响应信息 - JSON格式存储完整的API响应',
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true,
            comment: '发送失败原因',
          },
          {
            name: 'sentAt',
            type: 'datetime',
            isNullable: true,
            comment: '发送时间',
          },
          {
            name: 'scheduledAt',
            type: 'datetime',
            isNullable: true,
            comment: '计划发送时间 - NULL表示立即发送',
          },
          {
            name: 'readAt',
            type: 'datetime',
            isNullable: true,
            comment: '用户读取时间',
          },
          {
            name: 'retryCount',
            type: 'int',
            default: 0,
            isNullable: false,
            comment: '重试次数',
          },
          {
            name: 'maxRetries',
            type: 'int',
            default: 3,
            isNullable: false,
            comment: '最多重试次数',
          },
          {
            name: 'remark',
            type: 'text',
            isNullable: true,
            comment: '备注',
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // 创建索引以提升查询性能
    await queryRunner.createIndex(
      'wechat_notifications',
      new TableIndex({
        name: 'IDX_WECHAT_NOTIFICATIONS_OPENID',
        columnNames: ['openid'],
      }),
    );

    await queryRunner.createIndex(
      'wechat_notifications',
      new TableIndex({
        name: 'IDX_WECHAT_NOTIFICATIONS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'wechat_notifications',
      new TableIndex({
        name: 'IDX_WECHAT_NOTIFICATIONS_TYPE',
        columnNames: ['notificationType'],
      }),
    );

    await queryRunner.createIndex(
      'wechat_notifications',
      new TableIndex({
        name: 'IDX_WECHAT_NOTIFICATIONS_BUSINESS_ID',
        columnNames: ['businessId'],
      }),
    );

    await queryRunner.createIndex(
      'wechat_notifications',
      new TableIndex({
        name: 'IDX_WECHAT_NOTIFICATIONS_BUSINESS_TYPE',
        columnNames: ['businessType'],
      }),
    );

    await queryRunner.createIndex(
      'wechat_notifications',
      new TableIndex({
        name: 'IDX_WECHAT_NOTIFICATIONS_CREATED_AT',
        columnNames: ['createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'wechat_notifications',
      new TableIndex({
        name: 'IDX_WECHAT_NOTIFICATIONS_OPENID_STATUS',
        columnNames: ['openid', 'status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('wechat_notifications');
  }
}
