import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/security/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session.valid) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    username: session.username || "admin"
  });
}

