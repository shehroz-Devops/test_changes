import { MigrationInterface, QueryRunner } from 'typeorm'


export class CreateTableAppExperienceFeedback1678713765832 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "public"."app_experience_feedbacks"
        (

            "id"         CHARACTER VARYING        NOT NULL DEFAULT uuid_generate_v4(),
            "rating"     INTEGER                  not null,
            "comment"    CHARACTER VARYING        NOT NULL,
            "userID"     CHARACTER VARYING        NOT NULL,
            "feedbackID" CHARACTER VARYING        NOT NULL,
            "createdAt"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt"  TIMESTAMP WITH TIME ZONE          DEFAULT now(),
            CONSTRAINT "PK_app_experience_table" PRIMARY KEY ("id"),
            FOREIGN KEY ("feedbackID") REFERENCES feedbacks (id)
        )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS "public"."app_experience_feedbacks";
    `)
  }

}
