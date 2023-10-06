import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePostTable1696623870219 implements MigrationInterface {
    name = 'UpdatePostTable1696623870219'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coffee" RENAME COLUMN "name" TO "title"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coffee" RENAME COLUMN "title" TO "name"`);
    }

}
