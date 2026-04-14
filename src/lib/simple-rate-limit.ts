type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function checkSimpleRateLimit(args: { key: string; limit: number; windowMs: number }) {
  const now = Date.now();
  const current = buckets.get(args.key);

  if (!current || current.resetAt <= now) {
    buckets.set(args.key, { count: 1, resetAt: now + args.windowMs });
    return { allowed: true, remaining: args.limit - 1 };
  }

  if (current.count >= args.limit) {
    return { allowed: false, remaining: 0, retryAfterMs: current.resetAt - now };
  }

  current.count += 1;
  buckets.set(args.key, current);
  return { allowed: true, remaining: args.limit - current.count };
}
