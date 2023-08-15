import { AppError, EINVALID, IApplicationLogEvent } from '@fingoafrica/common'
import { IFeedbackInteractor, Feedback, Activity } from './feedback'
import { IFeedbackRepository } from './repository'

export class FeedbackInteractor implements IFeedbackInteractor {
  private repository: IFeedbackRepository

  constructor(repository: IFeedbackRepository) {
    this.repository = repository
  }

  public async addAppRating(
    feedback: {
      userId: string
      activity: Activity
      rating: number
      comment: string
    },
    logObj: IApplicationLogEvent
  ): Promise<string> {
    return this.repository.addAppFeedback(feedback, logObj)
  }

  public async addTransactionRating(
    feedback: {
      userId: string
      activity: Activity
      rating: number
      comment: string
      transactionType: string
    },
    logObj: IApplicationLogEvent
  ): Promise<string> {
    return this.repository.addTransactionFeedback(feedback, logObj)
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
    return await this.repository.updateFeedback(feedback, logObj)
  }

  public async deleteFeedback(id: string, activity: Activity, logObj: IApplicationLogEvent): Promise<void> {
    return await this.repository.deleteFeedback(id, activity, logObj)
  }

  public async findById(id: string, logObj: IApplicationLogEvent): Promise<Feedback | null> {
    return await this.repository.findById(id, logObj)
  }

  public async findByUserId(
    userId: string,
    limit: number,
    skip: number,
    logObj: IApplicationLogEvent
  ): Promise<Feedback[]> {
    return await this.repository.findByUserId(userId, limit, skip, logObj)
  }

  public async findLastFeedback(
    userId: string,
    activity: string,
    params: { txType?: string },
    logObj: IApplicationLogEvent
  ): Promise<Feedback | null> {
    if (!['TRANSACTION', 'APP_EXPERIENCE'].includes(activity)) {
      throw new AppError({
        errorType: EINVALID,
        apperrorCode: '',
        error: 'activity type not supported',
      })
    }

    return await this.repository.findLastFeedback(userId, activity as Activity, params, logObj)
  }
}
