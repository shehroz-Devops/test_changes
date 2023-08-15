export default interface IAppConfig {
  environment: string;
  msName: string
  port: number
  jwtKey: string
  postgres: {
    user: string;
    password: string;
    host: string;
    port: number;
    dbname: string;
  }
  typeorm: {
    entities: Array<string>;
  }
  growthbook: {
    secret: string
  },
  redis: {
    baseURL: string
  }
}
