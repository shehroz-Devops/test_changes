import { appLog, AuthObject, generateReqId, IApplicationLogEvent } from '@fingoafrica/common'
import request from 'supertest'
import app from '../../../src/app'
import jwt from 'jsonwebtoken'

describe('Update Feedback', () => {
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

  it('completes successfully', async () => {
    //get the domain defined in setup file
    const domain = (await global.getDomainAndRepositories()).domain
    const FeedbackRepo = (await global.getDomainAndRepositories()).repositories.feedbackRepo

    // create a fake user by signing in and generate a JWT
    let token = await global.signin()

    //Unhash JWT token to get userID of generated user
    let user = <AuthObject>jwt.verify(token, process.env.JWT_KEY!, {
      maxAge: '30m',
      algorithms: ['HS256'],
    })

    const feedback = await FeedbackRepo.addAppFeedback(
      {
        userId: user.id,
        activity: 'APP_EXPERIENCE',
        rating: 5,
        comment: 'Swift Delivery',
      },
      logObj
    )
    //call the route to get feedback by merchant id
    const response = await request(app(domain))
      .patch(`/feedback`)
      .set({ Authorization: token })
      .send({
        feedbackId: feedback,
        comment: 'Superb & Swift Delivery',
      })
      .expect(200)
      .then((res) => res.body)

    expect(response.status).toEqual('success')
  })

  it('Fails required body parameter missing', async () => {
    //get the domain defined in setup file
    const domain = await (await global.getDomainAndRepositories()).domain

    // create a fake user by signing in and generate a JWT
    let token = await global.signin()

    //Unhash JWT token to get userID of generated user
    let user = <AuthObject>jwt.verify(token, process.env.JWT_KEY!, {
      maxAge: '30m',
      algorithms: ['HS256'],
    })

    //call the route to get feedback by merchant id
    const response = await request(app(domain))
      .patch(`/feedback`)
      .set({ Authorization: token })
      .send({
        comment: 'Superb & Swift Delivery',
      })
      .expect(400)
      .then((res) => res.body)
  })
})
