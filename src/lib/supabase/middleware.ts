import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/giris";
      return NextResponse.redirect(url);
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const userRole = profile?.role ? String(profile.role).toLowerCase() : null;

    if (userRole && userRole !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users away from auth pages
  const isAuthRoute = request.nextUrl.pathname === "/giris" || 
                      request.nextUrl.pathname === "/kayit-ol" ||
                      request.nextUrl.pathname === "/sifre-sifirla" || 
                      request.nextUrl.pathname === "/sifre-yenile";

  if (isAuthRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const userRole = profile?.role ? String(profile.role).toLowerCase() : null;

    const url = request.nextUrl.clone();
    
    if (!userRole || userRole === "admin" || user.email?.includes("admin")) {
      url.pathname = "/admin";
    } else {
      url.pathname = "/";
    }
    
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
