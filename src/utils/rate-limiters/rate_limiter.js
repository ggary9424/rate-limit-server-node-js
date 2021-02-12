class RateLimiter {
  constructor() {
    if (!this.reserve) {
      throw new Error('RateLimiter must have reserve function');
    }
  }
}

module.exports = RateLimiter;
