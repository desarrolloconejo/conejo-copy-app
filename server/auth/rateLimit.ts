/**
 * Login attempt limiter.
 *
 * There is no reverse proxy in front of the app, so nothing else throttles
 * repeated sign-in attempts. This keeps counters in process memory: enough for
 * a single-instance deployment, and it resets on restart. If the app is ever
 * run as more than one replica, move this to the database or a shared cache.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const BASE_LOCK_MS = 60 * 1000;
const MAX_LOCK_MS = 30 * 60 * 1000;

type Bucket = { failures: number; firstFailureAt: number; lockedUntil: number };

const buckets = new Map<string, Bucket>();

function sweep(now: number) {
  for (const [key, bucket] of Array.from(buckets.entries())) {
    if (bucket.lockedUntil <= now && now - bucket.firstFailureAt > WINDOW_MS) {
      buckets.delete(key);
    }
  }
}

/** Milliseconds still to wait, or 0 when the caller may attempt a sign-in. */
export function retryAfterMs(key: string, now = Date.now()): number {
  const bucket = buckets.get(key);
  if (!bucket) return 0;
  return bucket.lockedUntil > now ? bucket.lockedUntil - now : 0;
}

export function recordFailure(key: string, now = Date.now()): void {
  sweep(now);
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.firstFailureAt > WINDOW_MS) {
    buckets.set(key, { failures: 1, firstFailureAt: now, lockedUntil: 0 });
    return;
  }

  bucket.failures += 1;
  if (bucket.failures >= MAX_ATTEMPTS) {
    // Back off further on every extra attempt past the threshold.
    const overflow = bucket.failures - MAX_ATTEMPTS;
    bucket.lockedUntil = now + Math.min(BASE_LOCK_MS * 2 ** overflow, MAX_LOCK_MS);
  }
}

export function recordSuccess(key: string): void {
  buckets.delete(key);
}

/** Test helper: drops every counter. */
export function resetRateLimit(): void {
  buckets.clear();
}
