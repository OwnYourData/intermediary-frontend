
function createRedisClient() {
}

const globalForRedis = globalThis as unknown as { redis: any };

export const redis =
    globalForRedis.redis || createRedisClient();

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
