import { appLog, AuthObject, generateReqId, IApplicationLogEvent } from '@fingoafrica/common'
import request from 'supertest'
import app from '../../../src/app'
import jwt from 'jsonwebtoken'

describe('Get Feedback', () => {
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

    //call the route to get feedback by id
    const response = await request(app(domain))
      .get(`/feedback/${feedback}`)
      .set({ Authorization: token })
      .expect(200)
      .then((res) => res.body)

    expect(response.status).toEqual('success')
    expect(response.data.id).toEqual(feedback)
    expect(response.data.activity).toEqual('APP_EXPERIENCE')
    expect(response.data.userId).toEqual(user.id)
    expect(response.data.comment).toEqual('Swift Delivery')
  })

  it('fails if no feedback with id found', async () => {
    //get the domain defined in setup file
    const domain = await (await global.getDomainAndRepositories()).domain

    // create a fake user by signing in and generate a JWT
    let token = await global.signin()

    //Unhash JWT token to get userID of generated user
    let user = <AuthObject>jwt.verify(token, process.env.JWT_KEY!, {
      maxAge: '30m',
      algorithms: ['HS256'],
    })

    //call the route to get feedback by id
    await request(app(domain))
      .get(`/feedback/${user.id}`)
      .set({ Authorization: token })
      .expect(400)
      .then((res) => res.body)
  })
})
