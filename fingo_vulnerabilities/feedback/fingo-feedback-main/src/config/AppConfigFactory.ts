import joi from 'joi'
import IAppConfig from '../config'

let entitiesPath = 'src/infra/repositories/**/*model.js'
if (process.env['CLUSTER_ENVIRONMENT_STAGE'] === 'LOCAL') {
  entitiesPath = 'src/infra/repositories/**/*model.ts'
}

export default class AppConfigFactory {
  public FromEnvVar(): IAppConfig {
    const envVarsSchema = joi
      .object()
      .keys({
        MS_NAME: joi.string().default('feedback'),
        PORT: joi.number().positive().default(3000),
        JWT_KEY: joi.string().required().description('jwt secret key'),
        CLUSTER_ENVIRONMENT_STAGE: joi.string().required(),

        TYPEORM_USERNAME: joi.string().required(),
        TYPEORM_PASSWORD: joi.string().required(),
        TYPEORM_HOST: joi.string().required(),
        TYPEORM_PORT: joi.number().required(),
        TYPEORM_DATABASE: joi.string().default('feedback'),
        TYPEORM_ENTITIES: joi.string().default(entitiesPath),

        GROWTHBOOK_SECRET: joi.string().required(),

        REDIS_BASE_URL: joi.string().required(),
      })
      .unknown()

    const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env)

    if (error) {
      throw new Error(`Config validation error: ${error.message}`)
    }

    return {
      environment: envVars.CLUSTER_ENVIRONMENT_STAGE,
      msName: envVars.MS_NAME,
      port: envVars.PORT,
      jwtKey: envVars.JWT_KEY,
      postgres: {
        user: envVars.TYPEORM_USERNAME,
        password: envVars.TYPEORM_PASSWORD,
        host: envVars.TYPEORM_HOST,
        port: envVars.TYPEORM_PORT,
        dbname: envVars.TYPEORM_DATABASE,
      },
      typeorm: {
        entities: [...envVars.TYPEORM_ENTITIES.split(',')],
      },
      growthbook: {
        secret: envVars.GROWTHBOOK_SECRET,
      },
      redis: {
        baseURL: envVars.REDIS_BASE_URL,
      },
    }
  }
}
