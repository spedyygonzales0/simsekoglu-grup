import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "sg_admin_session";
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function getAdminUsername(): string {
  return (process.env.ADMIN_USERNAME || "admin").trim();
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "a2424535b56D4.b";
}

function getSessionSecret(): string {
  const configured = process.env.ADMIN_SESSION_SECRET?.trim();
  if (configured) return configured;

  // Local fallback only. For production, set ADMIN_SESSION_SECRET in environment variables.
  if (process.env.NODE_ENV !== "production") {
    return "local-dev-admin-session-secret";
  }

  return `${getAdminUsername()}::${getAdminPassword()}::session`;
}

function safeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function secureEquals(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

export function validateAdminCredentials(username: unknown, password: unknown): boolean {
  const normalizedUsername = safeString(username).trim();
  const normalizedPassword = safeString(password);
  return (
    secureEquals(normalizedUsername, getAdminUsername()) &&
    secureEquals(normalizedPassword, getAdminPassword())
  );
}

export function createAdminSessionToken(username: string): string {
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
  const payload = `${username}|${expiresAt}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}|${signature}`, "utf8").toString("base64url");
}

export function verifyAdminSessionToken(token: string | undefined): { valid: boolean; username?: string } {
  if (!token) return { valid: false };

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [username, expiresAtRaw, signature] = decoded.split("|");
    if (!username || !expiresAtRaw || !signature) return { valid: false };

    const expiresAt = Number(expiresAtRaw);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return { valid: false };

    const expected = sign(`${username}|${expiresAt}`);
    if (!secureEquals(signature, expected)) return { valid: false };

    return { valid: true, username };
  } catch {
    return { valid: false };
  }
}

export function getAdminCookieConfig(expiresAt?: Date) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  };
}
