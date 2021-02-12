const Config = require('config');
const IORedis = require('ioredis');

const app = require('./src/server');

const SERVER_PORT = Config.get('SERVER_PORT');
const SERVER_KEEP_ALIVE_TIMEOUT = Config.get('SERVER_KEEP_ALIVE_TIMEOUT');
const SHOULD_TRUST_PROXY = Config.get('SHOULD_TRUST_PROXY');

const REDIS_URL = Config.get('REDIS_URL');

const ioredis = new IORedis(REDIS_URL, {
  retryStrategy: () => 1000,
  maxRetriesPerRequest: 1,
});

if (SHOULD_TRUST_PROXY) {
  app.enable('trust proxy');
}

app.set('port', SERVER_PORT);
app.set('ioredis', ioredis);
app.set('rate_limiter_interval_ms', 60 * 1000);
app.set('rate_limiter_limit', 60);
app.set('rate_limit_algorithm', 'sliding_window');

const server = app.listen(
  SERVER_PORT,
  () => { console.log('running on port', app.get('port')); },
);
server.keepAliveTimeout = SERVER_KEEP_ALIVE_TIMEOUT;
