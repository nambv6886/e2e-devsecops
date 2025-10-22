import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeUserToken1759714647517 implements MigrationInterface {
  name = 'ChangeUserToken1759714647517';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user-token\` DROP FOREIGN KEY \`FK_ba1896357c26216d9789bb009f7\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_ba1896357c26216d9789bb009f\` ON \`user-token\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user-token\` CHANGE \`userIdId\` \`userId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user-token\` ADD CONSTRAINT \`FK_6c43c95ddb18b3ae863e7c9d06e\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user-token\` DROP FOREIGN KEY \`FK_6c43c95ddb18b3ae863e7c9d06e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user-token\` CHANGE \`userId\` \`userIdId\` varchar(36) NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_ba1896357c26216d9789bb009f\` ON \`user-token\` (\`userIdId\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user-token\` ADD CONSTRAINT \`FK_ba1896357c26216d9789bb009f7\` FOREIGN KEY (\`userIdId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
