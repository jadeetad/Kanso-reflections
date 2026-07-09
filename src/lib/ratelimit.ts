import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const reflectionRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(50, "24 h"),
  analytics: true,
  prefix: "kanso:reflection",
});