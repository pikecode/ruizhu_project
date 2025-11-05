import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateUserAddressesTable1730000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_addresses',
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
          },
          {
            name: 'receiver_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Recipient name',
          },
          {
            name: 'receiver_phone',
            type: 'varchar',
            length: '20',
            isNullable: false,
            comment: 'Recipient phone number',
          },
          {
            name: 'province',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Province/State',
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'City/District',
          },
          {
            name: 'district',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'District/Area',
          },
          {
            name: 'address_detail',
            type: 'text',
            isNullable: false,
            comment: 'Detailed address',
          },
          {
            name: 'postal_code',
            type: 'varchar',
            length: '20',
            isNullable: true,
            comment: 'Postal code',
          },
          {
            name: 'is_default',
            type: 'tinyint',
            default: 0,
            comment: 'Is this the default address (0 or 1)',
          },
          {
            name: 'label',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Address label (Home, Work, etc)',
          },
          {
            name: 'is_deleted',
            type: 'tinyint',
            default: 0,
            comment: 'Soft delete flag',
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
        ],
        indices: [
          new TableIndex({
            columnNames: ['user_id'],
            name: 'idx_user_addresses_user_id',
          }),
          new TableIndex({
            columnNames: ['user_id', 'is_default'],
            name: 'idx_user_addresses_user_default',
          }),
          new TableIndex({
            columnNames: ['user_id', 'is_deleted'],
            name: 'idx_user_addresses_user_deleted',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user_addresses');
    if (table) {
      await queryRunner.dropTable(table);
    }
  }
}
