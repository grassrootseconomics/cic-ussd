import build from './app'
import { config } from './config'
import { initChainEventsHandler } from "@lib/events/handler";

const main = async () => {
  console.info('Starting server...')
  const app = await build()

  app.ready((error) => {
    if (error) {
      app.log.error(error)
      process.exit(1)
    }

    if (config.DEV) {
      app.log.debug(`Server routes: ${app.printRoutes()}`)
    }

    // perform initializations
    //initChainEventsHandler(app);

    app.listen(
      {
        host: config.SERVER.HOST,
        port: config.SERVER.PORT,
      },
      (error) => {
        if (error) {
          app.log.error(error)
          process.exit(1)
        }
      },
    )
  })

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      app.log.info('Gracefully shutting down.')
      await app.close()
      return process.exit(0)
    })
  }
}

main()