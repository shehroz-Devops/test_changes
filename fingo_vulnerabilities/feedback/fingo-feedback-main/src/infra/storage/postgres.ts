import { Connection, getConnectionManager } from 'typeorm'

export declare type ConnectionOptions = {
  host: string
  dbname: string
  user: string
  password: string
  port: number
  entities: Array<any>
}

export const PostgresClient = async (options: ConnectionOptions): Promise<Connection> => {
  const connectionManager = getConnectionManager()
  const connection = await connectionManager.create({
    type: 'postgres',
    schema: 'public',
    host: options.host,
    username: options.user,
    password: options.password,
    port: options.port,
    database: options.dbname,
    synchronize: process.env.CLUSTER_ENVIRONMENT_STAGE === 'TEST',
    logging: true,
    entities: options.entities,
  })

  await connection.connect()

  return connection
}
