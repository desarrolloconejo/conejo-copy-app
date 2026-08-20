const DEFAULT_SESSION_TTL_DAYS = 30;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. See ENVIRONMENT_TEMPLATE.md and set it before starting the server.`
    );
  }
  return value;
}

function sessionTtlMs(): number {
  const raw = process.env.SESSION_TTL_DAYS;
  const days = raw ? Number(raw) : DEFAULT_SESSION_TTL_DAYS;
  if (!Number.isFinite(days) || days <= 0) {
    throw new Error("SESSION_TTL_DAYS must be a positive number of days");
  }
  return days * 24 * 60 * 60 * 1000;
}

/**
 * Values are resolved on access, not on import, so unit tests can load modules
 * that reach for ENV without needing a full environment. Startup validation is
 * explicit instead: see assertEnv().
 */
export const ENV = {
  get cookieSecret() {
    return requireEnv("JWT_SECRET");
  },
  get databaseUrl() {
    return requireEnv("DATABASE_URL");
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
  get sessionTtlMs() {
    return sessionTtlMs();
  },
};

/** Fails fast at boot rather than on the first request that needs a value. */
export function assertEnv(): void {
  void ENV.cookieSecret;
  void ENV.databaseUrl;
  void ENV.sessionTtlMs;
}
