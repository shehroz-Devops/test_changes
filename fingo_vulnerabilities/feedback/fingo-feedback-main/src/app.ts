import 'reflect-metadata'
import express, { Application } from 'express'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import cookieSession from 'cookie-session'
import cors from 'cors'
import routes from './http/routes'
import { ApplicationErrorHandler, HTTPErrorHandler } from '@fingoafrica/common'
import Registry from './registry/registry'

/**
 * Implementation of class App.
 * You must initialize all application settings,
 * such as middleware settings.
 */
const App = (domain: Registry): Application => {
  const app = express()

  // middleware and configurations
  app.use(cors())
  app.use(helmet())
  app.use(helmet.noSniff()) // set X-Content-Type-Options header
  app.use(helmet.frameguard()) // set X-Frame-Options header
  app.use(helmet.xssFilter()) // set X-XSS-Protection header
  app.use(bodyParser.json({ limit: 1024 * 1024 * 100 }))
  app.use(bodyParser.urlencoded({ extended: true, limit: 1024 * 1024 * 100 }))
  app.use(
    cookieSession({
      signed: false,
      secure: process.env.NODE_ENV !== 'test',
    })
  )

  //add routes to application
  app.use(routes(domain))

  // initialize custom error handle last
  // initialize custom error handle last
  app.use(ApplicationErrorHandler()) // might want to inject logger
  HTTPErrorHandler(app)

  return app
}

export default App
