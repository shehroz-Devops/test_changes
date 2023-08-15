import { MigrationInterface, QueryRunner } from 'typeorm'


export class CreateUniqueConstraintFeedbackTable1680609457140 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "public"."feedbacks" ADD CONSTRAINT "UQ_activity_feedbacks" UNIQUE ("activity");
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "public"."feedbacks" DROP CONSTRAINT "UQ_activity_feedbacks";
    `)
  }

}
