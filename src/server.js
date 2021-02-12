const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const SlidingWindowRateLimiter = require('./utils/rate-limiters/sliding_window_rate_limiter');
const FixedWindowRateLimiter = require('./utils/rate-limiters/fixed_window_rate_limiter');

const app = express();

// Set up morgan
app.use((req, res, next) => {
  if (!app.get('should_disable_log') === true) {
    morgan('tiny')(req, res, next);
  } else {
    next();
  }
});

// Set up helmet
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

// Set up CORS
app.use(cors());

app.use(async (req, res, next) => {
  try {
    const { ip } = req;

    let limiter;
    if (app.get('rate_limit_algorithm') === 'sliding_window') {
      limiter = new SlidingWindowRateLimiter(app.get('ioredis'));
    } else if (app.get('rate_limit_algorithm') === 'fixed_window') {
      limiter = new FixedWindowRateLimiter(app.get('ioredis'));
    } else {
      limiter = new FixedWindowRateLimiter(app.get('ioredis'));
    }

    const interval = app.get('rate_limiter_interval_ms');
    const limit = app.get('rate_limiter_limit');

    const { isOverRateLimit, usage } = await limiter.reserve({
      key: ip,
      interval,
      limit,
    });

    if (isOverRateLimit) {
      return res.status(429).json({
        ip,
        usage,
      });
    }

    return res.status(200).json({
      ip,
      usage,
    });
  } catch (error) {
    next(error);
  }
});

// Common error handling
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error(
    `Unexpected error occurred when requesting ${req.method} ${req.path}.`,
    'error', error,
    'error.message', error.message,
    'error.stack', error.stack,
  );
  return res.status(500).json({
    errors: [{ msg: 'An unexpected error occurred. Please contact us.', code: 'unknown' }],
  });
});

module.exports = app;
