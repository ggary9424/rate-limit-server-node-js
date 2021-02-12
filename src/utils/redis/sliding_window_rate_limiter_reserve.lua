local key = KEYS[1]
local interval_milliseconds = tonumber(ARGV[1]) or 0
local interval_microseconds = interval_milliseconds * 1000
local limit = tonumber(ARGV[2]) or 0

redis.replicate_commands()

local redis_time = redis.call("TIME")
local now_microseconds = redis_time[1] * 1e6 + redis_time[2]

local window_start_microseconds = now_microseconds - interval_microseconds
redis.call("ZREMRANGEBYSCORE", key, "-inf", window_start_microseconds)

local usage = tonumber(redis.call("ZCOUNT", key, "-inf", "+inf")) or 0

if usage >= limit then
    return {true, usage}
end

redis.call("ZADD", key, "NX", now_microseconds, now_microseconds)
redis.call("EXPIRE", key, interval_milliseconds)

return {false, usage + 1}
