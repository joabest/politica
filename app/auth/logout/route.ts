import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete("arcanum-demo-session");
  return response;
}
