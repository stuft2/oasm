import {Request, Response} from 'express'
import {MongoClient} from 'mongodb'

export default function (db: MongoClient): Record<string, (req: Request, res: Response) => Promise<unknown>> {
  return {
    async search (req: Request, res: Response) {

    }
  }
}