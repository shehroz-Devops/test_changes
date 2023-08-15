import { MigrationInterface, QueryRunner } from 'typeorm'


export class CreateViewTriggerOnTransactionsFeedback1680100189276 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TRIGGER ratings_refresh_trigger_transaction
          AFTER INSERT OR UPDATE OR DELETE
          ON transaction_feedbacks
          FOR EACH STATEMENT
      EXECUTE PROCEDURE ratings_view_refresh();
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TRIGGER ratings_refresh_trigger_transaction ON transaction_feedbacks;
    `)
  }

}
