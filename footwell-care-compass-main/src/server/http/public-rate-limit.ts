type RateLimitEntry = Readonly<{ count: number; resetAt: number }>;

const entries = new Map<string, RateLimitEntry>();

export function takePublicRequestQuota(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): boolean {
  const current = entries.get(key);
  if (!current || current.resetAt <= now) {
    entries.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  entries.set(key, { count: current.count + 1, resetAt: current.resetAt });
  return true;
}

export function publicRequestKey(value: string | null): string {
  return value?.split(",")[0]?.trim() || "unknown";
}
