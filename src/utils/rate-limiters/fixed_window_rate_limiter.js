const fs = require('fs');
const path = require('path');
const IORedis = require('ioredis');

const RateLimiter = require('./rate_limiter');

class FixedWindowRateLimiter extends RateLimiter {
  constructor(redis) {
    super();

    if (!(redis instanceof IORedis)) {
      throw new Error('We only supports IORedis in SlidingWindowRateLimiter');
    }

    redis.defineCommand(
      'limiter_reserve',
      {
        lua: fs.readFileSync(path.join(__dirname, '../redis/fixed_window_rate_limiter_reserve.lua'), 'utf8'),
        numberOfKeys: 1,
      },
    );

    this.redis = redis;
  }

  async reserve({
    key,
    interval,
    limit,
  }) {
    const keyWithPrefix = `fixed_window_rate_limiter:${key}`;
    const values = await this.redis.limiter_reserve(keyWithPrefix, interval, limit);
    const result = {
      isOverRateLimit: values[0],
      usage: values[1],
    };

    return result;
  }
}

module.exports = FixedWindowRateLimiter;
