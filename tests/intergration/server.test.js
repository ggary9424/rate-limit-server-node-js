const request = require('supertest');
const IORedis = require('ioredis');
const pMap = require('p-map');
const app = require('../../src/server');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomPositiveInt(max) {
  if (typeof max !== 'number' || max <= 0) {
    throw new Error('parameter "max" in function getRandomPositiveInt should be greater than 0');
  }
  return Math.ceil(Math.random() * Math.floor(max));
}

beforeEach(async () => {
  // isolate modules where local state might conflict between tests.
  await jest.resetModules();

  // we need to trust proxy, so that we can fake the request ip
  app.set('trust proxy', true);

  // initialize redis instance
  const redis = new IORedis(global.__REDIS_URL); // eslint-disable-line no-underscore-dangle

  // flush all data
  await redis.flushall();

  app.set('ioredis', redis);
  app.set('should_disable_log', true);
});

afterEach(async () => {
  const redis = app.get('ioredis');

  // flush all data
  await redis.flushall();

  redis.quit();
});

describe('Test Server is Running', () => {
  it('will receive a http response', async () => {
    const res = await request(app).get('/').send();

    expect(res.statusCode).toBeGreaterThanOrEqual(100);
    expect(res.statusCode).toBeLessThanOrEqual(599);
  });
});

describe('Test Server with Sliding Window Rate Limit', () => {
  function testWithDifferentWays(algorithm) {
    it(`[${algorithm}] will receive a http response with a field "usage" in the body`, async () => {
      app.set('rate_limit_algorithm', algorithm);
      app.set('rate_limiter_interval_ms', 10 * 1000);
      app.set('rate_limiter_limit', 3);

      const res = await request(app).get('/').send();

      expect(typeof res.body.usage).toBe('number');
      expect(res.body.usage).toBeGreaterThanOrEqual(0);
    });

    it(`[${algorithm}] will reach rate limit after requesting server 3 times in 10 minutes`, async () => {
      const limit = getRandomPositiveInt(3);
      const intervalMS = 10 * 1000;

      app.set('rate_limit_algorithm', algorithm);
      app.set('rate_limiter_interval_ms', intervalMS);
      app.set('rate_limiter_limit', limit);

      for (let actualUsage = 1; actualUsage <= limit; actualUsage += 1) {
        const expected200Res = await request(app).get('/').send();
        expect(expected200Res.statusCode).toEqual(200);
        expect(typeof expected200Res.body.usage).toBe('number');
        expect(expected200Res.body.usage).toBe(actualUsage);
      }

      // Because given limit is less than 3, so it will just take a short time to finish the above requests.
      // So next two requests will be still in the given interval(10 secs).
      let expected429Res = await request(app).get('/').send();
      expect(expected429Res.statusCode).toEqual(429);
      expected429Res = await request(app).get('/').send();
      expect(expected429Res.statusCode).toEqual(429);
    });

    it(`[${algorithm}] will be able to receive a response with 200 status code after given rate limit interval`, async () => {
      const intervalMS = 3 * 1000;

      app.set('rate_limit_algorithm', algorithm);
      app.set('rate_limiter_interval_ms', intervalMS);
      app.set('rate_limiter_limit', 1);

      let expected200Res = await request(app).get('/').send();
      expect(expected200Res.statusCode).toEqual(200);
      expect(typeof expected200Res.body.usage).toBe('number');
      expect(expected200Res.body.usage).toBe(1);

      const expected429Res = await request(app).get('/').send();
      expect(expected429Res.statusCode).toEqual(429);

      await delay(intervalMS);

      expected200Res = await request(app).get('/').send();
      expect(expected200Res.statusCode).toEqual(200);
      expect(typeof expected200Res.body.usage).toBe('number');
      expect(expected200Res.body.usage).toBe(1);
    });

    it(`[${algorithm}] will check that each ip has its own rate limit`, async () => {
      const intervalMS = 60 * 1000;

      app.set('rate_limit_algorithm', algorithm);
      app.set('rate_limiter_interval_ms', intervalMS);
      app.set('rate_limiter_limit', 1);

      const ips = ['192.168.2.1', '192.168.2.2', '192.168.2.3'];
      await pMap(ips, async (ip) => {
        const expected200Res = await request(app)
          .get('/')
          .set('X-Forwarded-For', ip)
          .send();
        expect(expected200Res.statusCode).toEqual(200);
        expect(typeof expected200Res.body.usage).toBe('number');
        expect(expected200Res.body.usage).toBe(1);

        const expected429Res = await request(app)
          .get('/')
          .set('X-Forwarded-For', ip)
          .send();
        expect(expected429Res.statusCode).toEqual(429);
      });
    });
  }

  testWithDifferentWays('sliding_window');
  testWithDifferentWays('fixed_window');
});
