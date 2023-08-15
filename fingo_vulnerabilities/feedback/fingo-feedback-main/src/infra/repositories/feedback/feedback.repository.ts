import { Connection, Repository } from 'typeorm'
import { IApplicationLogEvent, appLog, AppError, EINTERNAL, EINVALID } from '@fingoafrica/common'
import { AppRatingEntity, RatingsViewEntity, FeedbackEntity, TransactionsRatingEntity } from './feedback.model'
import { IFeedbackRepository } from '../../../domain/feedback/repository'
import { Activity, Feedback } from '../../../domain/feedback/feedback'
import _ from 'lodash'

export class FeedbackRepository implements IFeedbackRepository {
  private readonly db: Connection
  private readonly repository: Repository<FeedbackEntity>

  constructor(connection: Connection) {
    this.db = connection
    this.repository = connection.getRepository(FeedbackEntity)
  }

  public async addTransactionFeedback(
    feedback: {
      userId: string
      activity: string
      rating: number
      transactionType: string
      comment: string
    },
    logObj: IApplicationLogEvent
  ): Promise<string> {
    appLog('info', { ...logObj, data: feedback, logMessage: 'About to add a feedback' })

    const feedbackRecord = await this.db
      .getRepository(FeedbackEntity)
      .createQueryBuilder()
      .where('activity = :activity', { activity: feedback.activity })
      .getOne()

    if (!feedbackRecord) {
      throw new AppError({
        errorType: EINVALID,
        error: 'activity not found',
        apperrorCode: '',
      })
    }

    const record = await this.db
      .getRepository(TransactionsRatingEntity)
      .createQueryBuilder()
      .insert()
      .into(TransactionsRatingEntity)
      .values({
        userID: feedback.userId,
        rating: feedback.rating,
        transactionType: feedback.transactionType,
        comment: feedback.comment,
        feedback: feedbackRecord,
      })
      .execute()
      .then((result) => {
        appLog('info', { ...logObj, data: { record: result.raw[0] }, logMessage: 'Saved feedback' })

        return result.raw[0]
      })

    return record.id
  }

  public async addAppFeedback(
    feedback: {
      userId: string
      activity: string
      rating: number
      comment: string
    },
    logObj: IApplicationLogEvent
  ): Promise<string> {
    appLog('info', { ...logObj, data: feedback, logMessage: 'About to add a feedback' })

    const feedbackRecord = await this.db
      .getRepository(FeedbackEntity)
      .createQueryBuilder()
      .where('activity = :activity', { activity: feedback.activity })
      .getOne()

    appLog('info', { ...logObj, data: feedbackRecord, logMessage: 'result' })

    if (!feedbackRecord) {
      throw new AppError({
        errorType: EINVALID,
        error: 'activity not found',
        apperrorCode: '',
      })
    }

    const record = await this.db
      .getRepository(AppRatingEntity)
      .createQueryBuilder()
      .insert()
      .into(AppRatingEntity)
      .values({
        userID: feedback.userId,
        rating: feedback.rating,
        comment: feedback.comment,
        feedback: feedbackRecord,
      })
      .execute()
      .then((result) => {
        appLog('info', { ...logObj, data: { record: result.raw[0] }, logMessage: 'Saved feedback' })

        return result.raw[0]
      })

    return record.id
  }

  public async updateFeedback(
    feedback: {
      id: string
      activity: Activity
      rating?: number
      comment?: string
    },
    logObj: IApplicationLogEvent
  ): Promise<void> {
    appLog('info', { ...logObj, data: feedback, logMessage: 'About to update a feedback by id' })

    if (feedback.activity === 'TRANSACTION') {
      const update: TransactionsRatingEntity = {
        rating: feedback.rating,
        comment: feedback.comment,
      }

      const values = _.omitBy(update, _.isNil)

      appLog('info', { ...logObj, data: { update }, logMessage: 'updating feedback' })

      const record = await this.db
        .getRepository(TransactionsRatingEntity)
        .createQueryBuilder()
        .update()
        .set({ ...values })
        .where('id = :id', { id: feedback.id })
        .returning('*')
        .execute()
        .then((result) => result.raw[0])

      appLog('info', { ...logObj, data: { record }, logMessage: 'Updated feedback' })
    } else if (feedback.activity === 'APP_EXPERIENCE') {
      const update: AppRatingEntity = {
        rating: feedback.rating,
        comment: feedback.comment,
      }

      const values = _.omitBy(update, _.isNil)

      appLog('info', { ...logObj, data: { update }, logMessage: 'updating feedback' })

      const record = await this.db
        .getRepository(AppRatingEntity)
        .createQueryBuilder()
        .update()
        .set({ ...values })
        .where('id = :id', { id: feedback.id })
        .returning('*')
        .execute()
        .then((result) => result.raw[0])

      appLog('info', { ...logObj, data: { record }, logMessage: 'Updated feedback' })
    }

    appLog('info', { ...logObj, data: { activity: feedback.activity }, logMessage: 'activity type not supported' })
  }

  public async deleteFeedback(id: string, activity: Activity, logObj: IApplicationLogEvent): Promise<void> {
    appLog('info', { ...logObj, data: { id }, logMessage: 'About to delete feedback by id' })

    if (activity === 'TRANSACTION') {
      await this.db
        .getRepository(TransactionsRatingEntity)
        .delete({ id })
        .catch((e) => {
          throw new AppError({
            error: e,
            apperrorCode: 'could not delete feedback',
            errorType: EINTERNAL,
          })
        })

      appLog('info', { ...logObj, data: { id }, logMessage: 'feedback deleted' })
    } else if (activity === 'APP_EXPERIENCE') {
      await this.db
        .getRepository(AppRatingEntity)
        .delete({ id })
        .catch((e) => {
          throw new AppError({
            error: e,
            apperrorCode: 'could not delete feedback',
            errorType: EINTERNAL,
          })
        })

      appLog('info', { ...logObj, data: { id }, logMessage: 'feedback deleted' })
    }

    appLog('info', { ...logObj, data: { activity }, logMessage: 'activity type not supported' })
  }

  //Find One
  public async findById(id: string, logObj: IApplicationLogEvent): Promise<Feedback | null> {
    appLog('info', { ...logObj, data: { id }, logMessage: 'About to get feedback' })

    const record = await this.db.getRepository(RatingsViewEntity).findOne({ id })

    if (!record) {
      return null
    }

    appLog('info', { ...logObj, data: { record }, logMessage: 'got feedback' })

    return viewSchemaToFeedback(record)
  }

  public async findByUserId(
    userId: string,
    limit: number,
    skip: number,
    logObj: IApplicationLogEvent
  ): Promise<Feedback[]> {
    appLog('info', { ...logObj, data: { userId }, logMessage: 'about to get last feedbacks' })

    const records = await this.db.getRepository(RatingsViewEntity).find({ userID: userId })

    if (!records) {
      return []
    }

    appLog('info', { ...logObj, data: { records }, logMessage: 'got user feedbacks' })

    return records.map((record) => viewSchemaToFeedback(record))
  }

  //Find Feedbacks by a customer
  public async findLastFeedback(
    userId: string,
    activity: Activity,
    params: { txType?: string },
    logObj: IApplicationLogEvent
  ): Promise<Feedback | null> {
    appLog('info', { ...logObj, data: { userId, activity }, logMessage: 'about to get last feedback' })

    let record: RatingsViewEntity | undefined
    if (!params.txType) {
      record = await this.db
        .getRepository(RatingsViewEntity)
        .createQueryBuilder()
        .where(`"userID" = :id`, { id: userId })
        .andWhere(`activity = :activity`, { activity })
        .orderBy(`"createdAt"`, 'DESC')
        .getOne()
    } else {
      record = await this.db
        .getRepository(RatingsViewEntity)
        .createQueryBuilder()
        .where(`"userID" = :id`, { id: userId })
        .andWhere('"transactionType" = :type', { type: params.txType })
        .andWhere(`activity = :activity`, { activity })
        .orderBy(`"createdAt"`, 'DESC')
        .getOne()
    }

    if (!record) {
      return null
    }

    appLog('info', { ...logObj, data: { record }, logMessage: 'got user feedback' })

    return viewSchemaToFeedback(record)
  }
}

const viewSchemaToFeedback = (record: RatingsViewEntity): Feedback => {
  return <Feedback>{
    id: record.id!,
    userId: record.userID!,
    activity: record.activity!,
    rating: record.rating!,
    lowerLimit: record.lowerLimit!,
    upperLimit: record.upperLimit!,
    comment: record.comment!,
    createdAt: record.createdAt!,
    metadata: {
      transactionType: record.transactionType,
    },
  }
}
