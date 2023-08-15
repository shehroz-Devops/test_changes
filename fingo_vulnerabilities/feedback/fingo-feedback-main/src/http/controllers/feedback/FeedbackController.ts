import { Request, Response, NextFunction } from 'express'
import { Activity, IFeedbackInteractor } from '../../../domain/feedback/feedback'
import { AppError, appLog, EINVALID, generateReqId, IApplicationLogEvent } from '@fingoafrica/common'
import { StatusCodes } from 'http-status-codes'
import Registry from '../../../registry/registry'

export class FeedbackController {
  #domain: Registry
  #feedbackDomain: IFeedbackInteractor

  constructor(domain: Registry) {
    this.#domain = domain
    this.#feedbackDomain = domain.Feedback
  }

  public async addFeedback(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const logObj: IApplicationLogEvent = {
      operationStage: 'processing',
      url: req.originalUrl,
      listenerName: 'feedback',
      logMessage: 'Request to add feedback',
      data: req.body,
      userId: req.auth.id,
      requestId: generateReqId('feedback', ''),
      requestTimestamp: Date.now(),
    }
    appLog('info', { ...logObj, operationStage: 'starting' })

    try {
      const { activity, rating, transactionType, comment } = req.body

      //Comeback and work on activity id

      const userId = req.auth.id

      let result = ''
      if (activity === 'TRANSACTION') {
        result = await this.#feedbackDomain.addTransactionRating(
          {
            userId,
            activity: activity as Activity,
            rating,
            comment,
            transactionType,
          },
          logObj
        )
      } else if (activity === 'APP_EXPERIENCE') {
        result = await this.#feedbackDomain.addAppRating(
          {
            userId,
            activity: activity as Activity,
            rating,
            comment,
          },
          logObj
        )
      } else {
        return next(
          new AppError({
            errorType: EINVALID,
            error: 'unknown activity type',
            apperrorCode: '',
          })
        )
      }

      appLog('info', {
        ...logObj,
        data: result,
        operationStage: 'completed',
        logMessage: 'successfully added feedback',
        resultCode: StatusCodes.OK,
        resultMessage: 'Request processed successfully',
      })

      res.status(200).json({
        status: 'success',
        message: 'successfully added feedback',
        data: {
          id: result,
        },
      })
    } catch (e) {
      appLog('error', {
        ...logObj,
        data: e,
        operationStage: 'failed',
        logMessage: 'An error occurred while adding feedback',
        resultCode: StatusCodes.INTERNAL_SERVER_ERROR,
        resultMessage: 'Internal server error',
      })
      next(e)
    }
  }

  public async updateFeedback(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const logObj: IApplicationLogEvent = {
      operationStage: 'processing',
      url: req.originalUrl,
      listenerName: 'feedback',
      logMessage: 'Request to update feedback',
      data: req.body,
      userId: req.auth.id,
      requestId: generateReqId('feedback', ''),
      requestTimestamp: Date.now(),
    }
    appLog('info', { ...logObj, operationStage: 'starting' })

    try {
      const { feedbackId, rating, comment } = req.body

      let body: any = {
        id: feedbackId,
        rating,
        comment,
      }

      let update = await this.#feedbackDomain.updateFeedback(body, logObj)

      appLog('info', {
        ...logObj,
        data: update,
        operationStage: 'completed',
        logMessage: 'successfully updated feedback',
        resultCode: StatusCodes.OK,
        resultMessage: 'feedback updated successfully',
      })

      res.status(200).json({
        status: 'success',
        message: 'successfully updated feedback',
        data: update,
      })
    } catch (e) {
      appLog('error', {
        ...logObj,
        data: e,
        operationStage: 'failed',
        logMessage: 'An error occurred for updating feedback',
        resultCode: StatusCodes.INTERNAL_SERVER_ERROR,
        resultMessage: 'Internal server error',
      })
      next(e)
    }
  }

  public async deleteFeedbackById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const logObj: IApplicationLogEvent = {
      operationStage: 'processing',
      url: req.originalUrl,
      listenerName: 'feedback',
      logMessage: 'delete feedback by id',
      data: req.body,
      userId: '',
      requestId: generateReqId('feedback', ''),
      requestTimestamp: Date.now(),
    }
    appLog('info', { ...logObj, operationStage: 'starting' })

    try {
      const { feedbackID } = req.params
      const { activity } = req.query as { [key: string]: Activity }

      if (!feedbackID) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'feedback id parameter not set',
          status: 'failed',
        })
        return
      }
      await this.#feedbackDomain.deleteFeedback(feedbackID, activity, logObj)

      appLog('info', {
        ...logObj,
        operationStage: 'completed',
        logMessage: 'successfully deleted feedback',
        resultCode: StatusCodes.OK,
        resultMessage: 'feedback deleted successfully',
      })

      res.status(200).json({
        status: 'success',
        message: 'successfully deleted',
        data: {},
      })
    } catch (e) {
      appLog('error', {
        ...logObj,
        data: e,
        operationStage: 'failed',
        logMessage: 'An error occurred for deleting feedback',
        resultCode: StatusCodes.INTERNAL_SERVER_ERROR,
        resultMessage: 'Internal server error',
      })
      next(e)
    }
  }

  public async getAFeedback(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const logObj: IApplicationLogEvent = {
      operationStage: 'processing',
      url: req.originalUrl,
      listenerName: 'fingo-feedback',
      logMessage: 'Request to get feedback details',
      data: req.params,
      userId: req.auth.id,
      requestId: generateReqId('feedback', ''),
      requestTimestamp: Date.now(),
    }
    appLog('info', { ...logObj, operationStage: 'starting' })

    try {
      const { feedbackID } = req.params

      if (!feedbackID) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: 'feedback id parameter not set',
          status: 'failed',
        })
        return
      }

      const feedback = await this.#feedbackDomain.findById(feedbackID, logObj)

      if (!feedback) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status: 'failed',
          message: 'no feedback with provided feedbackId found',
        })
        return
      }

      appLog('info', {
        ...logObj,
        data: { feedback },
        operationStage: 'completed',
        logMessage: 'successfully got feedback details',
        resultCode: StatusCodes.OK,
        resultMessage: 'Request processed successfully',
      })

      res.status(200).json({
        status: 'success',
        message: 'successfully got feedback details',
        data: feedback,
      })
    } catch (e) {
      appLog('error', {
        ...logObj,
        data: e,
        operationStage: 'failed',
        logMessage: 'An error occurred while getting feedback',
        resultCode: StatusCodes.INTERNAL_SERVER_ERROR,
        resultMessage: 'Internal server error',
      })
      next(e)
    }
  }

  public async getAllFeedbacksByAUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const logObj: IApplicationLogEvent = {
      operationStage: 'processing',
      url: req.originalUrl,
      listenerName: 'fingo-feedback',
      logMessage: 'Request to get all feedbacks by a user',
      data: {},
      userId: req.auth.id,
      requestId: generateReqId('feedback', ''),
      requestTimestamp: Date.now(),
    }
    appLog('info', { ...logObj, operationStage: 'starting' })

    try {
      const { limit, skip } = req.query as { [key: string]: string }

      const take = parseInt(limit)
      const offest = parseInt(skip)

      const feedbacks = await this.#feedbackDomain.findByUserId(req.auth.id, take, offest, logObj)

      appLog('info', {
        ...logObj,
        data: feedbacks,
        operationStage: 'completed',
        logMessage: 'successfully got user feebacks',
        resultCode: StatusCodes.OK,
        resultMessage: 'Request processed successfully',
      })

      res.status(200).json({
        status: 'success',
        message: 'successfully got user feebacks',
        data: feedbacks,
      })
    } catch (e) {
      appLog('error', {
        ...logObj,
        data: e,
        operationStage: 'failed',
        logMessage: 'An error occurred while getting user feebacks',
        resultCode: StatusCodes.INTERNAL_SERVER_ERROR,
        resultMessage: 'Internal server error',
      })
      next(e)
    }
  }

  public async getLastRating(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const logObj: IApplicationLogEvent = {
      operationStage: 'processing',
      url: req.originalUrl,
      listenerName: 'fingo-feedback',
      logMessage: 'Request to get last rating',
      data: req.query,
      userId: req.auth.id,
      requestId: generateReqId('feedback', ''),
      requestTimestamp: Date.now(),
    }
    appLog('info', { ...logObj, operationStage: 'starting' })

    try {
      const { activity, transactionType } = req.query as { [key: string]: string }

      const params = {
        txType: transactionType,
      }

      const feedback = await this.#feedbackDomain.findLastFeedback(req.auth.id, activity, params, logObj)

      appLog('info', {
        ...logObj,
        data: feedback,
        operationStage: 'completed',
        logMessage: 'successfully got user feebacks',
        resultCode: StatusCodes.OK,
        resultMessage: 'Request processed successfully',
      })

      res.status(200).json({
        status: 'success',
        message: 'successfully got user feebacks',
        data: feedback,
      })
    } catch (e) {
      appLog('error', {
        ...logObj,
        data: e,
        operationStage: 'failed',
        logMessage: 'An error occurred while getting user feebacks',
        resultCode: StatusCodes.INTERNAL_SERVER_ERROR,
        resultMessage: 'Internal server error',
      })
      next(e)
    }
  }
}
