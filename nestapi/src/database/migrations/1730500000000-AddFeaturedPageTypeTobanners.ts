import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeaturedPageTypeTobanners1730500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 修改 page_type ENUM 列，添加 'featured' 值
    try {
      await queryRunner.query(
        `ALTER TABLE banners MODIFY COLUMN page_type ENUM('home', 'custom', 'profile', 'about', 'featured') DEFAULT 'home' COMMENT '页面类型：home(首页) custom(私人定制) profile(个人页面) about(关于页面) featured(精选系列)'`
      );
      console.log('✓ Successfully updated page_type ENUM to include featured');
    } catch (error) {
      console.error('Error updating page_type ENUM:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 回滚：移除 'featured' 值
    try {
      await queryRunner.query(
        `ALTER TABLE banners MODIFY COLUMN page_type ENUM('home', 'custom', 'profile', 'about') DEFAULT 'home' COMMENT '页面类型：home(首页) custom(私人定制) profile(个人页面) about(关于页面)'`
      );
      console.log('✓ Successfully reverted page_type ENUM');
    } catch (error) {
      console.error('Error reverting page_type ENUM:', error);
      throw error;
    }
  }
}
