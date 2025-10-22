import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordChangedAt1759720000000 implements MigrationInterface {
  name = 'AddPasswordChangedAt1759720000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`passwordChangedAt\` timestamp NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`passwordChangedAt\``,
    );
  }
}
