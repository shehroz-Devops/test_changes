import { Request, Response } from 'express'

export default class HealthCheckController {
  // index returns status ok when called
  public async index(request: Request, response: Response): Promise<Response> {
    try {
      return response.status(200).send('ok')
    } catch (error) {
      return response.status(500).json({ message: 'Something went wrong.' })
    }
  }
}
