import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (process.env.ARCANUM_ENABLE_DEMO !== "true") {
    return NextResponse.json({ error: "Modo de demonstração desativado." }, { status: 404 });
  }
  const body = await request.json().catch(() => ({}));
  const username = process.env.ARCANUM_DEMO_USERNAME;
  const password = process.env.ARCANUM_DEMO_PASSWORD;
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
