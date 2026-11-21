type RateLimitEntry = Readonly<{ count: number; resetAt: number }>;

const entries = new Map<string, RateLimitEntry>();

let nextSweep = 0;

export function takePublicRequestQuota(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): boolean {
  if (now >= nextSweep) {
    for (const [id, entry] of entries) if (entry.resetAt <= now) entries.delete(id);
    nextSweep = now + 60_000;
  }
  if (!entries.has(key) && entries.size >= 50_000) return false;
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
