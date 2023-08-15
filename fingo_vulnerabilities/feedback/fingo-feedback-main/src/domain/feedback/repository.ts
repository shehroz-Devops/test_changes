import { IApplicationLogEvent } from '@fingoafrica/common'
import { Activity, Feedback } from './feedback'

export interface IFeedbackRepository {
  addTransactionFeedback(
    feedback: {
      userId: string
      activity: string
      rating: number
      transactionType: string
      comment: string
    },
    logObj: IApplicationLogEvent
  ): Promise<string>

  addAppFeedback(
    feedback: {
      userId: string
      activity: string
      rating: number
      comment: string
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
    activity: Activity,
    params: { txType?: string },
    logObj: IApplicationLogEvent,
  ): Promise<Feedback | null>
}
