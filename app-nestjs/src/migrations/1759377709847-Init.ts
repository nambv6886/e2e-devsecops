import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1759377709847 implements MigrationInterface {
  name = 'Init1759377709847';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`stores\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`type\` enum ('supermarket', 'gas_station', 'eatery', 'pharmacy', 'other') NOT NULL, \`address\` text NULL, \`latitude\` decimal(10,8) NULL, \`longitude\` decimal(11,8) NULL, \`location\` point NOT NULL, \`rating\` decimal(2,1) NOT NULL DEFAULT '0.0', \`isActive\` tinyint NOT NULL DEFAULT 1, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), SPATIAL INDEX \`idx_location\` (\`location\`), INDEX \`idx_type\` (\`type\`), INDEX \`idx_name\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_favorites\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, \`storeId\` varchar(36) NULL, UNIQUE INDEX \`uk_user_store\` (\`userId\`, \`storeId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_current_locations\` (\`id\` varchar(36) NOT NULL, \`latitude\` decimal(10,8) NOT NULL, \`longitude\` decimal(11,8) NOT NULL, \`location\` point NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, SPATIAL INDEX \`idx_location\` (\`location\`), UNIQUE INDEX \`REL_5591f8dff8a9e9bb2aac32820a\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_favorites\` ADD CONSTRAINT \`FK_1dd5c393ad0517be3c31a7af836\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_favorites\` ADD CONSTRAINT \`FK_2177eeacca827694186f4ab4c57\` FOREIGN KEY (\`storeId\`) REFERENCES \`stores\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_current_locations\` ADD CONSTRAINT \`FK_5591f8dff8a9e9bb2aac32820a1\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_current_locations\` DROP FOREIGN KEY \`FK_5591f8dff8a9e9bb2aac32820a1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_favorites\` DROP FOREIGN KEY \`FK_2177eeacca827694186f4ab4c57\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_favorites\` DROP FOREIGN KEY \`FK_1dd5c393ad0517be3c31a7af836\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_5591f8dff8a9e9bb2aac32820a\` ON \`user_current_locations\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx_location\` ON \`user_current_locations\``,
    );
    await queryRunner.query(`DROP TABLE \`user_current_locations\``);
    await queryRunner.query(
      `DROP INDEX \`uk_user_store\` ON \`user_favorites\``,
    );
    await queryRunner.query(`DROP TABLE \`user_favorites\``);
    await queryRunner.query(`DROP INDEX \`idx_name\` ON \`stores\``);
    await queryRunner.query(`DROP INDEX \`idx_type\` ON \`stores\``);
    await queryRunner.query(`DROP INDEX \`idx_location\` ON \`stores\``);
    await queryRunner.query(`DROP TABLE \`stores\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
