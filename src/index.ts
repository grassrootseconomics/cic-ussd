import build from './app'
import { config } from './config'

const main = () => {
  const app = build()

  app.ready((error) => {
    if (error) {
      app.log.error(error)
      process.exit(1)
    }

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
      app.log.info('Gracefully shutting down')
      await app.close()
      return process.exit(0)
    })
  }
}

main()
