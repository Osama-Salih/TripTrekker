import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1721581407983 implements MigrationInterface {
    name = 'Init1721581407983'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`address\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`address\` varchar(255) NOT NULL`);
    }

}
