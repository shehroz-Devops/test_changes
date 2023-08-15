import { Router } from 'express'
import { verifyAccess, verifyToken, requestValidator } from '@fingoafrica/common'
import HealthCheckController from '../middleware/HealthCheckController'
import Registry from '../../registry/registry'
import { FeedbackController } from '../controllers/feedback/FeedbackController'
import { feedbackRequests } from '../requests/feedback'

const Routing = (domain: Registry): Router => {
  const routes = Router()
  const feedbackController = new FeedbackController(domain)

  const healthcheckController = new HealthCheckController()

  routes.get('/', healthcheckController.index.bind(healthcheckController))

  routes.post(
    '/',
    verifyToken,
    verifyAccess('1'),
    requestValidator(feedbackRequests.AddFeedback),
    feedbackController.addFeedback.bind(feedbackController)
  )

  routes.patch(
    '/',
    verifyToken,
    verifyAccess('1'),
    requestValidator(feedbackRequests.UpdateFeedback),
    feedbackController.updateFeedback.bind(feedbackController)
  )

  routes.delete(
    '/:feedbackID',
    verifyToken,
    verifyAccess('1'),
    requestValidator(feedbackRequests.DeleteFeedback),
    feedbackController.deleteFeedbackById.bind(feedbackController)
  )

  routes.get('/:feedbackID', verifyToken, verifyAccess('1'), feedbackController.getAFeedback.bind(feedbackController))

  routes.get(
    '/user/feedbacks',
    verifyToken,
    verifyAccess('1'),
    requestValidator(feedbackRequests.GetFeedbacks),
    feedbackController.getAllFeedbacksByAUser.bind(feedbackController)
  )

  routes.get(
    '/user/feedback',
    verifyToken,
    verifyAccess('1'),
    feedbackController.getLastRating.bind(feedbackController)
  )

  return Router().use('/feedback', routes)
}

export default Routing
