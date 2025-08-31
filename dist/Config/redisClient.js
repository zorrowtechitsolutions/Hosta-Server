"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redis = void 0;
// src/config/redisClient.ts
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.redis = (0, redis_1.createClient)({
    socket: {
        host: process.env.REDIS_HOST,
        port: 10988,
    },
    username: "default",
    password: process.env.REDIS_PASS,
});
exports.redis.on("error", (err) => console.error("🔴 Redis error:", err));
exports.redis.on("connect", () => console.log("🟢 Redis connected"));
exports.redis.on("end", () => console.warn("🟡 Redis connection closed"));
const connectRedis = async () => {
    if (!exports.redis.isOpen) {
        await exports.redis.connect();
    }
};
exports.connectRedis = connectRedis;
//# sourceMappingURL=redisClient.js.map