const MAX_FAILED_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 3 * 60 * 1000;

interface AttemptInfo {
  attempts: number;
  lockedUntil: number;
}

const attemptsByIp = new Map<string, AttemptInfo>();

export function isIpLocked(ip: string): { locked: boolean; retryAfterMs?: number } {
  const record = attemptsByIp.get(ip);
  if (!record) return { locked: false };
  if (record.lockedUntil <= Date.now()) {
    attemptsByIp.delete(ip);
    return { locked: false };
  }
  return { locked: true, retryAfterMs: record.lockedUntil - Date.now() };
}

export function registerFailedAttempt(ip: string): { locked: boolean; retryAfterMs?: number } {
  const current = attemptsByIp.get(ip);
  const nextAttempts = (current?.attempts || 0) + 1;
  const lockedUntil =
    nextAttempts >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCK_WINDOW_MS : current?.lockedUntil || 0;

  attemptsByIp.set(ip, {
    attempts: nextAttempts,
    lockedUntil
  });

  if (lockedUntil > Date.now()) {
    return { locked: true, retryAfterMs: lockedUntil - Date.now() };
  }
  return { locked: false };
}

export function clearAttempts(ip: string): void {
  attemptsByIp.delete(ip);
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

