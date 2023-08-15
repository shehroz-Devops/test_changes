import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTableFeedback1666101110568 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        BEGIN;
        
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        CREATE TABLE IF NOT EXISTS "public"."feedbacks"
        (
            "id"         character varying NOT NULL,
            "activity"   character varying NOT NULL,
            "lowerLimit" INTEGER           NOT NULL DEFAULT 1,
            "upperLimit" INTEGER           NOT NULL,
            CONSTRAINT "PK_a1af8c4cde0663ef1e1fcc513c6" PRIMARY KEY ("id")
        );
        
        COMMIT;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "public"."feedbacks";
    `)
  }
}
