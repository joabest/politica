import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = process.env.ARCANUM_DEMO_USERNAME || "mkt2026";
  const password = process.env.ARCANUM_DEMO_PASSWORD || "mkt2026";
  if (body.username !== username || body.password !== password) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("arcanum-demo-session", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
