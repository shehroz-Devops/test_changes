import { MigrationInterface, QueryRunner } from 'typeorm'


export class SeedFeedbacksTable1680609764650 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "public"."feedbacks" (id, activity, "lowerLimit", "upperLimit")
        VALUES (uuid_generate_v4(), 'APP_EXPERIENCE', 1, 5),
               (uuid_generate_v4(), 'TRANSACTION', 1, 10)

        ON CONFLICT ON CONSTRAINT "UQ_activity_feedbacks" DO NOTHING;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "public"."feedbacks" WHERE activity IN ('APP_EXPERIENCE', 'TRANSACTION');
    `)
  }

}
