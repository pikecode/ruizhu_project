import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPriceSnapshotToCartItems1730000001001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('cart_items');

    // 检查列是否已存在
    const columnExists = table?.columns.some(col => col.name === 'price_snapshot');

    if (!columnExists) {
      await queryRunner.addColumn(
        'cart_items',
        new TableColumn({
          name: 'price_snapshot',
          type: 'int',
          isNullable: true,
          comment: 'Product price at the time of adding to cart (in cents)',
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('cart_items');
    const columnExists = table?.columns.some(col => col.name === 'price_snapshot');

    if (columnExists) {
      await queryRunner.dropColumn('cart_items', 'price_snapshot');
    }
  }
}
