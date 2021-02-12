local key = KEYS[1]
local interval_milliseconds = tonumber(ARGV[1]) or 0
local limit = tonumber(ARGV[2]) or 0

if interval_milliseconds == 0 then
    return {false, 0}
end

redis.replicate_commands()

redis.call('set', KEYS[1], 0, 'PX', interval_milliseconds, 'NX')
local usage = redis.call('incr', KEYS[1])

if usage > limit then
    return {true, usage}
end

return {false, usage}