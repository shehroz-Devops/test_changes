import { appLog, AuthObject, generateReqId, IApplicationLogEvent } from '@fingoafrica/common'
import request from 'supertest'
import app from '../../../src/app'
import jwt from 'jsonwebtoken'

describe('Add Feedback', () => {
  let domain: any
  let token: string
  let user: AuthObject

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

  beforeEach(async () => {
    //get the domain defined in setup file
    domain = (await global.getDomainAndRepositories()).domain

    // create a fake user by signing in and generate a JWT
    token = await global.signin()

    //Unhash JWT token to get userID of generated user
    user = <AuthObject>jwt.verify(token, process.env.JWT_KEY!, {
      maxAge: '30m',
      algorithms: ['HS256'],
    })
  })

  it('completes successfully', async () => {
    //call the route to get users transactions using the generated user token
    const response = await request(app(domain))
      .post(`/feedback`)
      .send({
        activity: 'APP_EXPERIENCE',
        rating: 5,
        comment: 'Best Fintech',
      })
      .set({ Authorization: token })
      .expect(200)
      .then((res) => res.body)

    expect(response.status).toEqual('success')
  })

  it('fails required body not passed ', async () => {
    //call the route to get users transactions using the generated user token
    const response = await request(app(domain))
      .post(`/feedback`)
      .set({ Authorization: token })
      .send({
        rating: 5,
        comment: 'Best Fintech',
      })
      .expect(400)
      .then((res) => res.body)
  })

  it('fails if transaction type is not provided for TRANSACTION activity ', async () => {
    //call the route to get users transactions using the generated user token
    const response = await request(app(domain))
      .post(`/feedback`)
      .set({ Authorization: token })
      .send({
        activity: 'TRANSACTION',
        rating: 5,
        comment: 'Best Fintech',
      })
      .expect(400)
      .then((res) => res.body)
  })
})
