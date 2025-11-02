import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubCategoryToCollectionProducts1730518000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 添加 sub_category 列
    try {
      await queryRunner.query(
        `ALTER TABLE collection_products ADD COLUMN sub_category VARCHAR(50) NULL COMMENT '子类别: clothing, jewelry, shoes, perfume 等'`
      );

      // 添加索引
      await queryRunner.query(
        `CREATE INDEX idx_collection_products_collection_sub_category ON collection_products(collection_id, sub_category)`
      );

      console.log('✓ Successfully added sub_category column to collection_products');
    } catch (error) {
      console.error('Error adding sub_category column:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 回滚：删除索引和列
    try {
      await queryRunner.query(
        `DROP INDEX idx_collection_products_collection_sub_category ON collection_products`
      );

      await queryRunner.query(
        `ALTER TABLE collection_products DROP COLUMN sub_category`
      );

      console.log('✓ Successfully reverted sub_category column');
    } catch (error) {
      console.error('Error reverting sub_category column:', error);
      throw error;
    }
  }
}
