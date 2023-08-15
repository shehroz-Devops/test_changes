import { Connection } from 'typeorm'
import IAppConfig from '../config'
import { IFeedbackInteractor } from '../domain/feedback/feedback'
import { FeedbackInteractor } from '../domain/feedback/interactor'
import { IFeedbackRepository } from '../domain/feedback/repository'
import { FeedbackRepository } from '../infra/repositories/feedback/feedback.repository'

// Registry initializes objects/dependencies required by domain layer and initializes
// interactors too.
export default class Registry {
  public readonly Config: IAppConfig
  public readonly Feedback: IFeedbackInteractor

  // constructor will initialize all interactors and their dependencies
  constructor(postgresClient: Connection, config: IAppConfig) {
    // initialize repo
    const feedbackRepo: IFeedbackRepository = new FeedbackRepository(postgresClient)

    // initialize business logic (interactors) and inject dependencies
    this.Config = config
    this.Feedback = new FeedbackInteractor(feedbackRepo)
  }
}
