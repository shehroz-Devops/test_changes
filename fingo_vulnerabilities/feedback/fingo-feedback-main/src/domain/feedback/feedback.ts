import { IApplicationLogEvent } from '@fingoafrica/common'

export type Activity = 'TRANSACTION' | 'APP_EXPERIENCE'

export type Feedback = {
  id: string
  userId: string
  activity: Activity
  rating: number
  lowerLimit: number
  upperLimit: number
  comment: string
  createdAt: Date
  metadata: {
    transactionType?: string
  }
}

export interface IFeedbackInteractor {
  addAppRating(
    feedback: {
      userId: string
      activity: Activity
      rating: number
      comment: string
    },
    logObj: IApplicationLogEvent
  ): Promise<string>

  addTransactionRating(
    feedback: {
      userId: string
      activity: Activity
      rating: number
      comment: string
      transactionType: string
    },
    logObj: IApplicationLogEvent
  ): Promise<string>

  updateFeedback(
    feedback: {
      id: string
      activity: Activity
      rating?: number
      comment?: string
    },
    logObj: IApplicationLogEvent
  ): Promise<void>

  deleteFeedback(id: string, activity: Activity, logObj: IApplicationLogEvent): Promise<void>

  findById(id: string, logObj: IApplicationLogEvent): Promise<Feedback | null>

  findByUserId(userId: string, limit: number, skip: number, logObj: IApplicationLogEvent): Promise<Feedback[]>

  findLastFeedback(
    userId: string,
    activity: string,
    params: { txType?: string },
    logObj: IApplicationLogEvent
  ): Promise<Feedback | null>
}
