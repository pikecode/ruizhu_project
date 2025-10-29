import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * 微信支付订单表迁移脚本
 * 创建 wechat_payments 表用于存储所有微信支付订单信息
 *
 * 表结构说明：
 * - 存储商户订单号 (outTradeNo) 和微信交易号 (transactionId)
 * - 支持支付状态跟踪 (pending, success, failed, cancelled)
 * - JSON字段存储回调数据和业务元数据
 * - 创建索引提升查询性能
 */
export class CreateWechatPaymentsTable1729774800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wechat_payments',
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
            name: 'outTradeNo',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
            comment: '商户订单号 - 商家侧的订单编号，需要唯一',
          },
          {
            name: 'transactionId',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '微信支付订单号 - 微信返回的交易号',
          },
          {
            name: 'prepayId',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '预支付交易会话标识 - 调用微信统一下单API返回',
          },
          {
            name: 'totalFee',
            type: 'int',
            isNullable: false,
            comment: '支付金额（分）',
          },
          {
            name: 'body',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: '订单标题/商品描述',
          },
          {
            name: 'detail',
            type: 'text',
            isNullable: true,
            comment: '订单详情',
          },
          {
            name: 'notifyUrl',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: '回调通知的URL - 支付成功时微信服务器会通知该地址',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'success', 'failed', 'cancelled'],
            default: "'pending'",
            isNullable: false,
            comment: '支付状态',
          },
          {
            name: 'payTime',
            type: 'datetime',
            isNullable: true,
            comment: '支付完成时间',
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
            comment: '业务数据 - JSON格式存储相关的业务数据',
          },
          {
            name: 'paymentMethod',
            type: 'varchar',
            length: '50',
            default: "'wechat'",
            isNullable: false,
            comment: '支付方式 (balance, wechat, alipay)',
          },
          {
            name: 'wechatCallback',
            type: 'json',
            isNullable: true,
            comment: '微信回调数据 - 存储微信服务器返回的完整回调信息',
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
      'wechat_payments',
      new TableIndex({
        name: 'IDX_WECHAT_PAYMENTS_OPENID',
        columnNames: ['openid'],
      }),
    );

    await queryRunner.createIndex(
      'wechat_payments',
      new TableIndex({
        name: 'IDX_WECHAT_PAYMENTS_OUT_TRADE_NO',
        columnNames: ['outTradeNo'],
      }),
    );

    await queryRunner.createIndex(
      'wechat_payments',
      new TableIndex({
        name: 'IDX_WECHAT_PAYMENTS_TRANSACTION_ID',
        columnNames: ['transactionId'],
      }),
    );

    await queryRunner.createIndex(
      'wechat_payments',
      new TableIndex({
        name: 'IDX_WECHAT_PAYMENTS_PREPAY_ID',
        columnNames: ['prepayId'],
      }),
    );

    await queryRunner.createIndex(
      'wechat_payments',
      new TableIndex({
        name: 'IDX_WECHAT_PAYMENTS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'wechat_payments',
      new TableIndex({
        name: 'IDX_WECHAT_PAYMENTS_CREATED_AT',
        columnNames: ['createdAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('wechat_payments');
  }
}
