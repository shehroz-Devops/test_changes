import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm'
import moment from 'moment'
import { JoinColumn, ManyToOne } from 'typeorm'

@Entity('feedbacks')
export class FeedbackEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column({ nullable: true })
  activity?: string

  @Column({ nullable: true })
  lowerLimit?: number

  @Column({ nullable: true })
  upperLimit?: number
}

@Entity('transaction_feedbacks')
export class TransactionsRatingEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column({ nullable: false })
  rating?: number

  @Column({ nullable: true })
  userID?: string

  @Column({ nullable: false })
  transactionType?: string

  @Column({ nullable: true })
  comment?: string

  @ManyToOne(() => FeedbackEntity)
  @JoinColumn({ name: 'feedbackID' })
  feedback?: FeedbackEntity

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: moment.utc().toDate(),
  })
  createdAt?: Date

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    onUpdate: moment.utc().toDate().toString(),
    nullable: true,
  })
  updatedAt?: Date
}

@Entity('app_experience_feedbacks')
export class AppRatingEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column({ nullable: false })
  userID?: string

  @Column({ nullable: false })
  rating?: number

  @Column({ nullable: true })
  comment?: string

  @ManyToOne(() => FeedbackEntity)
  @JoinColumn({ name: 'feedbackID' })
  feedback?: FeedbackEntity

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: moment.utc().toDate(),
  })
  createdAt?: Date

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    onUpdate: moment.utc().toDate().toString(),
    nullable: true,
  })
  updatedAt?: Date
}

@ViewEntity({
  name: 'ratings_view',
  expression: `
    SELECT *
    FROM (
      SELECT app.id, app.rating, app.comment,app."userID",f.activity,f."lowerLimit",f."upperLimit",app."createdAt",null as "transactionType"
        FROM app_experience_feedbacks app,feedbacks f
        WHERE app."feedbackID" = f.id
      UNION
      SELECT tx.id,tx.rating,tx.comment,tx."userID",f.activity,f."lowerLimit",f."upperLimit",tx."createdAt",tx."transactionType"
        FROM transaction_feedbacks tx,feedbacks f
        WHERE tx."feedbackID" = f.id) results
      ORDER BY results."createdAt" DESC;
  `,
})
export class RatingsViewEntity {
  @ViewColumn()
  id?: string

  @ViewColumn()
  rating?: number

  @ViewColumn()
  lowerLimit?: number

  @ViewColumn()
  upperLimit?: number

  @ViewColumn()
  comment?: string

  @ViewColumn()
  activity?: string

  @ViewColumn()
  userID?: string

  @ViewColumn()
  transactionType?: string

  @ViewColumn()
  createdAt?: Date
}
