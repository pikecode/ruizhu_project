import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateOrdersTable1730000003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
            comment: 'User who placed the order',
          },
          {
            name: 'order_number',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
            comment: 'Unique order number for reference',
          },
          {
            name: 'payment_id',
            type: 'int',
            isNullable: true,
            comment: 'Link to wechat_payments table',
          },
          {
            name: 'address_id',
            type: 'int',
            isNullable: true,
            comment: 'Delivery address ID',
          },
          {
            name: 'items',
            type: 'json',
            isNullable: false,
            comment: 'Array of order items with product_id, quantity, price, attributes',
          },
          {
            name: 'total_amount',
            type: 'int',
            isNullable: false,
            comment: 'Total order amount in cents',
          },
          {
            name: 'shipping_amount',
            type: 'int',
            default: 0,
            isNullable: false,
            comment: 'Shipping cost in cents',
          },
          {
            name: 'discount_amount',
            type: 'int',
            default: 0,
            isNullable: false,
            comment: 'Discount amount in cents',
          },
          {
            name: 'final_amount',
            type: 'int',
            isNullable: false,
            comment: 'Final amount to pay in cents (total + shipping - discount)',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'],
            default: "'pending'",
            isNullable: false,
            comment: 'Order status',
          },
          {
            name: 'remark',
            type: 'text',
            isNullable: true,
            comment: 'Order notes or buyer remarks',
          },
          {
            name: 'tracking_number',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Logistics tracking number',
          },
          {
            name: 'shipped_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Time when order was shipped',
          },
          {
            name: 'delivered_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Time when order was delivered',
          },
          {
            name: 'cancelled_at',
            type: 'timestamp',
            isNullable: true,
            comment: 'Time when order was cancelled',
          },
          {
            name: 'refund_amount',
            type: 'int',
            default: 0,
            isNullable: false,
            comment: 'Refunded amount in cents',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['payment_id'],
            referencedTableName: 'wechat_payments',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
          new TableForeignKey({
            columnNames: ['address_id'],
            referencedTableName: 'user_addresses',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          }),
        ],
        indices: [
          new TableIndex({
            columnNames: ['user_id'],
            name: 'idx_orders_user_id',
          }),
          new TableIndex({
            columnNames: ['payment_id'],
            name: 'idx_orders_payment_id',
          }),
          new TableIndex({
            columnNames: ['order_number'],
            name: 'idx_orders_order_number',
          }),
          new TableIndex({
            columnNames: ['status'],
            name: 'idx_orders_status',
          }),
          new TableIndex({
            columnNames: ['user_id', 'status'],
            name: 'idx_orders_user_status',
          }),
          new TableIndex({
            columnNames: ['created_at'],
            name: 'idx_orders_created_at',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('orders');
    if (table) {
      await queryRunner.dropTable(table);
    }
  }
}
