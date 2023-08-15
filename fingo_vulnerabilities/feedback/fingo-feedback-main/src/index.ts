require('dotenv').config()
import '@fingoafrica/common/build/monitoring'
import app from './app'
import AppConfigFactory from './config/AppConfigFactory'
import Registry from './registry/registry'
import { PostgresClient } from './infra/storage/postgres'

async function run(): Promise<void> {
  try {
    console.log('Fingo Feedback service starting 🔧....')
    // fetch application configs
    const appConfigFactory = new AppConfigFactory()
    const appconfig = appConfigFactory.FromEnvVar()

    // connect application to persistent storage
    // make connection to postgres
    const postgresClient = await PostgresClient({
      host: appconfig.postgres.host,
      dbname: appconfig.postgres.dbname,
      user: appconfig.postgres.user,
      password: appconfig.postgres.password,
      port: appconfig.postgres.port,
      entities: appconfig.typeorm.entities,
    })

    // await awsMessagingWrapper.setup(microservice)
    // const ff = await new RedisFF(appconfig.redis.baseURL).init()
    // instantiate business logic
    const domain = new Registry(postgresClient, appconfig)

    // start listening on events
    // new EventsListener(awsMessagingWrapper.get(), domain).listen()

    // start serving application
    app(domain).listen(3000, () => {
      console.log('Listening on port 3000!')
    })
  } catch (error) {
    // if we dont establish connection, fail early
    console.log(error)
    process.exit(1)
  }
}

run()
