import { Request } from 'express'
import { appLog, generateReqId, IApplicationLogEvent } from '@fingoafrica/common'
import { StatusCodes } from 'http-status-codes'
import moment from 'moment'

export const initialLog = (req: Request): IApplicationLogEvent => {
  return {
    operationStage: 'processing',
    url: req.originalUrl,
    listenerName: 'transactions',
    resultCode: StatusCodes.ACCEPTED,
    resultMessage: '',
    logMessage: 'Request to perform fingo to paybill received',
    data: { ...req.body, pin: '****' },
    userId: req.auth.id,
    requestId: generateReqId('transactions', req.auth.id),
    requestTimestamp: moment.utc().toDate().getTime(),
  }
}

export const logFinish = (data: any, logObj: IApplicationLogEvent, logMessage: string) => {
  appLog('info', {
    ...logObj,
    data,
    operationStage: 'completed',
    logMessage,
    resultCode: StatusCodes.OK,
    resultMessage: 'Request processed successfully',
  })
}

export const OTPGenerator = (max: number): string => {
  if (process.env.CLUSTER_ENVIRONMENT_STAGE !== 'PRODUCTION') {
    return '000111'
  }

  // Declare a digits variable
  // which stores all digits
  const digits = '0123456789'
  let OTP = ''
  for (let i = 0; i < max; i++) {
    OTP += digits[Math.floor(Math.random() * 10)]
  }
  return OTP
}
