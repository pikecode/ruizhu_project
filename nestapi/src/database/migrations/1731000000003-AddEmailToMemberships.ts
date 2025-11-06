import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Add email field to memberships table
 * 为 memberships 表添加邮箱字段
 */
export class AddEmailToMemberships1731000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('memberships');

    // 检查字段是否已存在
    const emailColumnExists = table?.columns.find((col) => col.name === 'email');

    if (!emailColumnExists) {
      await queryRunner.addColumn(
        'memberships',
        new TableColumn({
          name: 'email',
          type: 'varchar',
          length: '100',
          isNullable: true,
          default: null,
          comment: '邮箱地址',
        }),
      );

      console.log('✅ Added email column to memberships table');
    } else {
      console.log('⚠️  email column already exists in memberships table');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('memberships');

    // 检查字段是否存在
    const emailColumnExists = table?.columns.find((col) => col.name === 'email');

    if (emailColumnExists) {
      await queryRunner.dropColumn('memberships', 'email');

      console.log('✅ Removed email column from memberships table');
    } else {
      console.log('⚠️  email column does not exist in memberships table');
    }
  }
}
