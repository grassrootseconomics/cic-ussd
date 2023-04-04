import app from '@/app';
import { config } from '@/config';
import { loadSystemVouchers } from '@lib/ussd/utils';


app.ready(async (error) => {
  if (error) {
    app.log.error(error);
    process.exit(1);
  }

  await loadSystemVouchers(app.graphql, app.p_redis)
});

app.listen({ host: config.SERVER.HOST, port: config.SERVER.PORT },
  (error) => {
    if (error) {
      app.log.error(error);
      process.exit(1);
    }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    app.log.info('Gracefully shutting down.')
    await app.close()
    return process.exit(0)
  })
}