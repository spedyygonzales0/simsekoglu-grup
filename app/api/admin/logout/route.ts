import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getAdminCookieConfig } from "@/lib/security/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_COOKIE_NAME,
    "",
    getAdminCookieConfig(new Date(0))
  );
  return response;
}

