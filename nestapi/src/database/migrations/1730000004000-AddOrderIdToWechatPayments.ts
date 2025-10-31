import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddOrderIdToWechatPayments1730000004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add order_id column to wechat_payments table
    await queryRunner.addColumn(
      'wechat_payments',
      new TableColumn({
        name: 'order_id',
        type: 'int',
        isNullable: true,
        comment: 'Link to orders table - establishes relationship between payment and order',
      }),
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'wechat_payments',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        name: 'fk_wechat_payments_order_id',
      }),
    );

    // Add index for quick lookups
    await queryRunner.createIndex(
      'wechat_payments',
      new TableIndex({
        columnNames: ['order_id'],
        name: 'idx_wechat_payments_order_id',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the index
    await queryRunner.dropIndex('wechat_payments', 'idx_wechat_payments_order_id');

    // Remove the foreign key
    const table = await queryRunner.getTable('wechat_payments');
    if (table) {
      const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('order_id') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('wechat_payments', foreignKey);
      }
    }

    // Remove the column
    await queryRunner.dropColumn('wechat_payments', 'order_id');
  }
}
