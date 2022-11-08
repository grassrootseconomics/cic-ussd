import pino from 'pino';

/* Exporting the pino logger with the level set to the environment variable
LOG_LEVEL or info if it is not set. */
export default pino({
  level: process.env.LOG_LEVEL || 'info',
  base: undefined,
});
