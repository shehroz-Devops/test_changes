import { appLog, AuthObject, generateReqId, IApplicationLogEvent } from '@fingoafrica/common'
import request from 'supertest'
import app from '../../../src/app'
import jwt from 'jsonwebtoken'
import { IFeedbackRepository } from '../../../src/domain/feedback/repository'

describe('Get all feedbacks from a user', () => {
  const logObj: IApplicationLogEvent = {
    operationStage: 'processing',
    listenerName: 'feedback',
    logMessage: 'Test',
    data: {},
    userId: '',
    requestId: generateReqId('feedback'),
    requestTimestamp: Date.now(),
  }
  appLog('info', { ...logObj, operationStage: 'starting' })

  let domain: any
  let FeedbackRepo: IFeedbackRepository
  let token: string
  let user: AuthObject

  beforeEach(async () => {
    domain = (await global.getDomainAndRepositories()).domain
    FeedbackRepo = (await global.getDomainAndRepositories()).repositories.feedbackRepo
    token = await global.signin()
    user = <AuthObject>jwt.verify(token, process.env.JWT_KEY!, {
      maxAge: '30m',
      algorithms: ['HS256'],
    })
  })

  it('completes successfully', async () => {
    const feedback = await FeedbackRepo.addAppFeedback(
      {
        userId: user.id,
        activity: 'APP_EXPERIENCE',
        rating: 5,
        comment: 'Hitch free carting process',
      },
      logObj
    )

    const feedback1 = await FeedbackRepo.addTransactionFeedback(
      {
        userId: user.id,
        activity: 'TRANSACTION',
        rating: 5,
        comment: 'Swift Delivery',
        transactionType: 'mpesaToFingo',
      },
      logObj
    )

    const feedback2 = await FeedbackRepo.addTransactionFeedback(
      {
        userId: user.id,
        activity: 'TRANSACTION',
        rating: 5,
        comment: 'Swift Transaction, 0 charges',
        transactionType: 'fingoToMpesa',
      },
      logObj
    )

    //call the route to get feedback by merchant id
    const response = await request(app(domain))
      .get(`/feedback/user/feedbacks?limit=9&skip=0`)
      .set({ Authorization: token })
      .expect(200)
      .then((res) => res.body)

    console.log(response.data)

    expect(response.status).toEqual('success')
    expect(response.data.length).toEqual(3)
  })
})
