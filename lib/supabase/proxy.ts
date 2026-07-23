import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "./config";

export async function updateSession(request: NextRequest) {
  const publicPath = request.nextUrl.pathname === "/login";

  if (!isSupabaseConfigured()) {
    const demoSession = request.cookies.get("arcanum-demo-session")?.value === "1";
    if (!demoSession && !publicPath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (demoSession && publicPath) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const authenticated = Boolean(data?.claims);

  if (!authenticated && !publicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (authenticated && publicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return response;
}
