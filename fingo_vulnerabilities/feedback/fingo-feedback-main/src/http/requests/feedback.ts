import * as Joi from 'joi'

export const feedbackRequests = {
  AddFeedback: Joi.object().keys({
    activity: Joi.string().required(),
    rating: Joi.number().required(),
    comment: Joi.string().allow(''),
    transactionType: Joi.when('activity', { is: 'TRANSACTION', then: Joi.string().required() }),
  }),
  UpdateFeedback: Joi.object().keys({
    feedbackId: Joi.string().required(),
    rating: Joi.number(),
    comment: Joi.string().allow(''),
  }),
  GetFeedbacks: Joi.object().keys({
    skip: Joi.number().default(0),
    limit: Joi.number().default(10),
  }),
  DeleteFeedback: Joi.object().keys({
    activity: Joi.string().required(),
  }),
}
