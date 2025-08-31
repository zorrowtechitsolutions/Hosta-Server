"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheMiddleware = void 0;
const redisClient_1 = require("../Config/redisClient");
const cacheMiddleware = (durationInSeconds) => {
    return async (req, res, next) => {
        const cacheKey = `__express__${req.originalUrl}`;
        try {
            if (!redisClient_1.redis.isOpen) {
                console.warn("⚠ Redis is not open. Skipping cache.");
                return next();
            }
            const cachedData = await redisClient_1.redis.get(cacheKey);
            if (cachedData) {
                console.log("✅ Cache hit:", cacheKey);
                res.setHeader("Content-Type", "application/json");
                res.send(cachedData);
                return;
            }
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                redisClient_1.redis
                    .set(cacheKey, JSON.stringify(body), {
                    EX: durationInSeconds,
                })
                    .catch(console.error);
                return originalJson(body);
            };
            next();
        }
        catch (err) {
            console.error("Redis Cache Error:", err);
            next();
        }
    };
};
exports.cacheMiddleware = cacheMiddleware;
//# sourceMappingURL=cache.middleware.js.map