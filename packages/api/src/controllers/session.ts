import {Request, Response} from 'express'
import {Db} from 'mongodb'

export = function (db: Db): Record<string, (req: Request, res: Response) => Promise<unknown>> {
  return {
    async create (req: Request, res: Response) {

    }
  }
}
