import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1722100161760 implements MigrationInterface {
  name = 'Init1722100161760';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`firstName\` varchar(200) NOT NULL, \`lastName\` varchar(200) NOT NULL, \`username\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`phone\` varchar(255) NOT NULL, \`gender\` varchar(255) NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`role\` enum ('admin', 'user') NOT NULL DEFAULT 'user', \`passwordChangedAt\` timestamp NULL, \`passwordResetCode\` varchar(255) NULL, \`passwordResetExpire\` timestamp NULL, \`passwordResetVerify\` tinyint NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`flights\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`flight_number\` varchar(255) NOT NULL, \`duration\` varchar(255) NOT NULL, \`origin_code\` varchar(255) NOT NULL, \`destination_code\` varchar(255) NOT NULL, \`airline_code\` enum ('SV', 'QR', 'EK', 'UEU') NULL, \`departure_date\` datetime NOT NULL, \`arrival_date\` datetime NOT NULL, \`travel_class\` enum ('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST') NOT NULL DEFAULT 'ECONOMY', \`price\` decimal NOT NULL, \`currency_code\` varchar(3) NOT NULL, \`non_stop\` tinyint NOT NULL DEFAULT 0, \`return_date\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`activities\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`activityId\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`location\` json NOT NULL, \`price\` decimal NOT NULL, \`currency\` varchar(3) NULL DEFAULT 'USD', \`pictures\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`hotels\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`hotelId\` varchar(255) NOT NULL, \`currency\` varchar(3) NOT NULL, \`name\` varchar(255) NOT NULL, \`location\` json NOT NULL, \`roomType\` varchar(255) NOT NULL, \`amenities\` text NULL, \`description\` text NOT NULL, \`price\` decimal NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`booking\` (\`id\` bigint NOT NULL AUTO_INCREMENT, \`bookingDate\` timestamp NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` bigint NOT NULL, \`flightId\` bigint NULL, \`hotelId\` bigint NULL, \`activityId\` bigint NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_336b3f4a235460dc93645fbf222\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_cc8ec8fa07ca411f70625d36f87\` FOREIGN KEY (\`flightId\`) REFERENCES \`flights\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_a8c9f0b0d2e97e4cdf825d3d830\` FOREIGN KEY (\`hotelId\`) REFERENCES \`hotels\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_fd708f91b164e55cc8f6ac2f8d8\` FOREIGN KEY (\`activityId\`) REFERENCES \`activities\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_fd708f91b164e55cc8f6ac2f8d8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_a8c9f0b0d2e97e4cdf825d3d830\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_cc8ec8fa07ca411f70625d36f87\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_336b3f4a235460dc93645fbf222\``,
    );
    await queryRunner.query(`DROP TABLE \`booking\``);
    await queryRunner.query(`DROP TABLE \`hotels\``);
    await queryRunner.query(`DROP TABLE \`activities\``);
    await queryRunner.query(`DROP TABLE \`flights\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
