import path from 'path'
import express, {Request, Response} from 'express'
import debug from 'debug'
import Enforcer from 'openapi-enforcer-middleware'
import * as env from './util/env'
import {connect} from './db/connection'
import {EnforcerError} from './middleware/openapi-error'

const logger = debug('api:server')

const {db, server} = env.get()

;(async (): Promise<void> => {
  try {
    // Connect to database
    const uri = `mongodb://${encodeURIComponent(db.username)}:${encodeURIComponent(db.password)}${db.host}:${db.port}/${db.database}`
    const client = await connect(uri)

    // Create Express server instance
    const app = express()

    // Server health check
    app.get('/xhealth', (req: Request, res: Response) => res.status(200).send('The force is strong with this one.'))

    // Parse JSON request bodies
    app.use(express.json())

    // Log all requests to the server
    app.use((req, res, next) => {
      const now = new Date()
      logger(`${req.method} called on ${req.originalUrl} at ${now.toLocaleTimeString('en-US', { timeZone: 'America/Denver', timeZoneName: 'short', weekday: 'short', month: 'short', day: 'numeric' })} (${now.toISOString()})`)
      logger('Query:', req.query)
      logger('Body:', JSON.stringify(req.body))
      next()
    })

    // Set up server paths using api definition document
    const controllerDir = path.resolve(__dirname, 'controllers')
    const oasPath = path.resolve(__dirname, 'openapi.yaml')

    const enforcer = new Enforcer(oasPath)
    await enforcer.promise // Wait for enforcer to resolve OAS doc

    // Set up controllers, use dependency injection to pass through database connection
    await enforcer.controllers(controllerDir, client.db)

    // Plugin enforcer middleware to Express
    app.use(enforcer.middleware())

    // Enforcer error handling middleware
    app.use(EnforcerError)

    // Start server
    app.listen(server.port, () => {
      logger(`Server started on port ${server.port}`)
    })
  } catch (e) {
    logger('Error starting server:', e)
    process.exit(1)
  }
})()
