import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductTypeToProducts1730520000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 添加 product_type 列
    try {
      await queryRunner.query(
        `ALTER TABLE products ADD COLUMN product_type VARCHAR(50) DEFAULT 'standard' COMMENT '产品类型: standard(标准产品) custom(私人定制专属)'`
      );

      // 添加索引以提高查询性能
      await queryRunner.query(
        `CREATE INDEX idx_products_product_type ON products(product_type)`
      );

      console.log('✓ Successfully added product_type column to products table');
    } catch (error) {
      console.error('Error adding product_type column:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 回滚：删除索引和列
    try {
      await queryRunner.query(
        `DROP INDEX idx_products_product_type ON products`
      );

      await queryRunner.query(
        `ALTER TABLE products DROP COLUMN product_type`
      );

      console.log('✓ Successfully reverted product_type column');
    } catch (error) {
      console.error('Error reverting product_type column:', error);
      throw error;
    }
  }
}
