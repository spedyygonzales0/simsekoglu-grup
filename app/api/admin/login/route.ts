import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getAdminCookieConfig,
  validateAdminCredentials
} from "@/lib/security/admin-auth";
import {
  clearAttempts,
  getClientIp,
  isIpLocked,
  registerFailedAttempt
} from "@/lib/security/admin-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Geçersiz istek." }, { status: 400 });
  }

  const username = typeof (payload as { username?: unknown })?.username === "string"
    ? (payload as { username: string }).username
    : "";
  const password = typeof (payload as { password?: unknown })?.password === "string"
    ? (payload as { password: string }).password
    : "";

  const ip = getClientIp(request.headers);
  const lockState = isIpLocked(ip);
  if (lockState.locked) {
    const retryAfter = Math.max(1, Math.ceil((lockState.retryAfterMs || 0) / 1000));
    return NextResponse.json(
      { ok: false, message: "Çok fazla hatalı giriş denemesi. Lütfen kısa süre sonra tekrar deneyin." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) }
      }
    );
  }

  if (!validateAdminCredentials(username, password)) {
    const failed = registerFailedAttempt(ip);
    return NextResponse.json(
      {
        ok: false,
        message: failed.locked
          ? "Çok fazla hatalı giriş yapıldı. Lütfen 3 dakika sonra tekrar deneyin."
          : "Kullanıcı adı veya şifre hatalı."
      },
      { status: 401 }
    );
  }

  clearAttempts(ip);

  const normalizedUsername = username.trim();
  const token = createAdminSessionToken(normalizedUsername);
  const response = NextResponse.json({
    ok: true,
    username: normalizedUsername
  });

  response.cookies.set(ADMIN_COOKIE_NAME, token, getAdminCookieConfig());
  return response;
}
