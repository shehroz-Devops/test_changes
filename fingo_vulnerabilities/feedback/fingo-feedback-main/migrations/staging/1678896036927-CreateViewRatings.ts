import { MigrationInterface, QueryRunner } from 'typeorm'


export class CreateViewRatings1678896036927 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      BEGIN;
    
      -- create the view
      CREATE MATERIALIZED VIEW IF NOT EXISTS ratings_view AS
      SELECT *
      FROM (SELECT app.id,
                   app.rating,
                   app.comment,
                   app."userID",
                   f.activity,
                   f."lowerLimit",
                   f."upperLimit",
                   app."createdAt",
                   null as "transactionType"
            FROM app_experience_feedbacks app,
                 feedbacks f
            WHERE app."feedbackID" = f.id
            UNION
            SELECT tx.id,
                   tx.rating,
                   tx.comment,
                   tx."userID",
                   f.activity,
                   f."lowerLimit",
                   f."upperLimit",
                   tx."createdAt",
                   tx."transactionType"
            FROM transaction_feedbacks tx,
                 feedbacks f
            WHERE tx."feedbackID" = f.id) results
      ORDER BY results."createdAt" DESC;

      
      -- create a unique index on id column
      CREATE UNIQUE INDEX ui_rating_id_view ON ratings_view (id);
      
      -- create db procedure to refresh materialized view
      CREATE OR REPLACE FUNCTION ratings_view_refresh()
          RETURNS trigger
          LANGUAGE plpgsql AS
      $$
      BEGIN
          REFRESH MATERIALIZED VIEW CONCURRENTLY ratings_view;
          RETURN NULL;
      END;
      $$;

      -- create trigger to call the refresh procedure
      CREATE TRIGGER ratings_refresh_trigger
          AFTER INSERT OR UPDATE OR DELETE
          ON app_experience_feedbacks
          FOR EACH STATEMENT
      EXECUTE PROCEDURE ratings_view_refresh();
      
      COMMIT;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP MATERIALIZED VIEW public.ratings_view CASCADE;
    `)
  }

}
