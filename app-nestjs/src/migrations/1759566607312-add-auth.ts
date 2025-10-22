import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuth1759566607312 implements MigrationInterface {
    name = 'AddAuth1759566607312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user-token\` (\`id\` varchar(36) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`raw_token\` varchar(255) NOT NULL, \`expire_time\` timestamp NOT NULL, \`userIdId\` varchar(36) NULL, UNIQUE INDEX \`REL_ba1896357c26216d9789bb009f\` (\`userIdId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`salt\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user-token\` ADD CONSTRAINT \`FK_ba1896357c26216d9789bb009f7\` FOREIGN KEY (\`userIdId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user-token\` DROP FOREIGN KEY \`FK_ba1896357c26216d9789bb009f7\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`salt\``);
        await queryRunner.query(`DROP INDEX \`REL_ba1896357c26216d9789bb009f\` ON \`user-token\``);
        await queryRunner.query(`DROP TABLE \`user-token\``);
    }

}
