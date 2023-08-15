import jwt from 'jsonwebtoken'
import Registry from '../src/registry/registry'
import { Connection } from 'typeorm'
import { PostgresClient } from '../src/infra/storage/postgres'
import {
  AppRatingEntity,
  FeedbackEntity,
  TransactionsRatingEntity,
} from '../src/infra/repositories/feedback/feedback.model'
import { v4 as uuid } from 'uuid'
import AppConfigFactory from '../src/config/AppConfigFactory'
import { FeedbackRepository } from '../src/infra/repositories/feedback/feedback.repository'
import { IFeedbackRepository } from '../src/domain/feedback/repository'

//define a global interface that is accessible to every test
declare global {
  namespace NodeJS {
    interface Global {
      signin(): Promise<string>
      signinAdmin(permissions: string[]): Promise<string>
      signinDevice(): Promise<string>
      getDomainAndRepositories(): Promise<{
        domain: Registry
        repositories: {
          feedbackRepo: IFeedbackRepository
        }
      }>
    }
  }
}

const publishOrderStatusUpdatedMock = jest.fn()

//define postgres
let pgConn: Connection

//perform setup for tests before running them
beforeAll(async () => {
  jest.setTimeout(1000000)
  process.env.JWT_KEY = 'asdfasdf'
  process.env.MS_NAME = 'feedback'
  process.env.CLUSTER_ENVIRONMENT_STAGE = 'TEST'
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  process.env.TYPEORM_CONNECTION = 'postgres'
  process.env.TYPEORM_USERNAME = 'tester'
  process.env.TYPEORM_PASSWORD = 'testingjkl'
  process.env.TYPEORM_HOST = 'localhost'
  process.env.TYPEORM_PORT = '5432'
  process.env.TYPEORM_DATABASE = 'test'

  process.env.GROWTHBOOK_SECRET = 'fake_growthbook_secret'
  process.env.REDIS_BASE_URL = 'fake_redis_url'

  try {
    pgConn = await PostgresClient({
      host: process.env['TYPEORM_HOST']!,
      port: Number(process.env['TYPEORM_PORT']!),
      dbname: process.env['TYPEORM_DATABASE']!,
      user: process.env['TYPEORM_USERNAME']!,
      password: process.env['TYPEORM_PASSWORD']!,
      entities: ['src/infra/repositories/**/*model.ts'],
    })

    // add some seed values to feedback table
    await pgConn.getRepository(FeedbackEntity).save([
      { activity: 'TRANSACTION', lowerLimit: 1, upperLimit: 10 },
      { activity: 'APP_EXPERIENCE', lowerLimit: 1, upperLimit: 5 },
    ])
  } catch (e) {
    console.log(e)
  }
})

//before each test
beforeEach(async () => {
  //clear mocked functions and reset them
  jest.clearAllMocks()

  //clear records in postgres tables
  await pgConn.createQueryBuilder().delete().from(AppRatingEntity).execute()
  await pgConn.createQueryBuilder().delete().from(TransactionsRatingEntity).execute()
})

//after all tests
afterAll(async () => {
  // clear table schemas
  const queryRunner = pgConn.createQueryRunner()
  await queryRunner.connect()

  await queryRunner.query('START TRANSACTION;')
  await queryRunner.query('DROP SCHEMA public CASCADE;')
  await queryRunner.query('CREATE SCHEMA public;')
  await queryRunner.query('GRANT ALL ON SCHEMA public TO tester;')
  await queryRunner.query('GRANT ALL ON SCHEMA public TO public;')
  await queryRunner.query(`COMMENT ON SCHEMA public IS 'standard public schema';`)
  await queryRunner.query('COMMIT;')

  await queryRunner.release()
  await pgConn.close()
})

//global function to pass domain to tests.
global.getDomainAndRepositories = async () => {
  const config = new AppConfigFactory().FromEnvVar()

  const domain = new Registry(pgConn, config)
  const feedbackRepository: IFeedbackRepository = new FeedbackRepository(pgConn)
  return {
    domain,
    repositories: {
      feedbackRepo: feedbackRepository,
    },
  }
}

//global function to generate and signin a user device.
global.signinDevice = async () => {
  // Build a JWT payload.  { id, email }
  const payload = {
    id: uuid(),
    email: 'test@test.com',
    fullName: 'test boi',
    phoneNumber: '+254700111222',
  }

  // Create the JWT!
  return jwt.sign(payload, process.env.JWT_KEY! + 'testuid', {
    algorithm: 'HS256',
    expiresIn: '30m',
  })
}

//global function to generate and sign in a fake user
global.signin = async () => {
  // Build a JWT payload.  { id, email }
  const payload = {
    id: uuid(),
    email: 'test@test.com',
    fullName: 'test boi',
    phoneNumber: '+254700111222',
  }

  // Create the JWT!
  return jwt.sign(payload, process.env.JWT_KEY!, {
    algorithm: 'HS256',
    expiresIn: '30m',
  })
}

//global function to generate and sign in a fake admin for tests
global.signinAdmin = async (permissions: string[]) => {
  // Build a JWT payload.  { id, email }
  const payload = {
    id: uuid(),
    email: 'test@test.com',
    fullName: 'test boi',
    phoneNumber: '+254700111222',
    permissions,
  }

  // Create the JWT!
  return jwt.sign(payload, process.env.JWT_KEY! + 'admin', {
    algorithm: 'HS256',
    expiresIn: '30m',
  })
}
