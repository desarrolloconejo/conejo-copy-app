import { beforeEach, describe, expect, it } from "vitest";
import { recordFailure, recordSuccess, resetRateLimit, retryAfterMs } from "./rateLimit";

const KEY = "email:alguien@example.com";

describe("login rate limiter", () => {
  beforeEach(() => resetRateLimit());

  it("lets a fresh key through", () => {
    expect(retryAfterMs(KEY)).toBe(0);
  });

  it("only locks after repeated failures", () => {
    for (let i = 0; i < 7; i += 1) recordFailure(KEY);
    expect(retryAfterMs(KEY)).toBe(0);

    recordFailure(KEY);
    expect(retryAfterMs(KEY)).toBeGreaterThan(0);
  });

  it("backs off further on each attempt past the threshold", () => {
    const now = 1_000_000;
    for (let i = 0; i < 8; i += 1) recordFailure(KEY, now);
    const firstLock = retryAfterMs(KEY, now);

    recordFailure(KEY, now);
    expect(retryAfterMs(KEY, now)).toBeGreaterThan(firstLock);
  });

  it("caps the lock so an account is never shut out indefinitely", () => {
    const now = 1_000_000;
    for (let i = 0; i < 40; i += 1) recordFailure(KEY, now);
    expect(retryAfterMs(KEY, now)).toBeLessThanOrEqual(30 * 60 * 1000);
  });

  it("clears the counter on a successful sign-in", () => {
    const now = 1_000_000;
    for (let i = 0; i < 10; i += 1) recordFailure(KEY, now);
    expect(retryAfterMs(KEY, now)).toBeGreaterThan(0);

    recordSuccess(KEY);
    expect(retryAfterMs(KEY, now)).toBe(0);
  });

  it("keeps keys independent", () => {
    const now = 1_000_000;
    for (let i = 0; i < 10; i += 1) recordFailure(KEY, now);
    expect(retryAfterMs("ip:127.0.0.1", now)).toBe(0);
  });

  it("forgets isolated failures once the window has passed", () => {
    const start = 1_000_000;
    for (let i = 0; i < 7; i += 1) recordFailure(KEY, start);

    // A single failure well after the window starts a new count rather than
    // adding to the old one.
    const later = start + 16 * 60 * 1000;
    recordFailure(KEY, later);
    expect(retryAfterMs(KEY, later)).toBe(0);
  });
});
