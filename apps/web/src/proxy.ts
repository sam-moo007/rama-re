import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware — refreshes Supabase session on every request and
 * sets __Host-rama-*-token cookies from the active JWT so the
 * API proxy route handlers can authenticate API calls.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Authenticate user to suppress the getSession warning, then grab session for tokens
  await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  // Derive role from JWT claims (injected by the Postgres Hook).
  const roles: string[] = session?.user?.user_metadata?.["rama_roles"] ?? [];
  const isStaff = roles.includes("staff") || roles.includes("admin");
  const isAdvisor = roles.includes("advisor") || isStaff;

  const { pathname } = request.nextUrl;

  // Public paths — never redirect.
  // These are accessible without authentication.
  const isPublic =
    pathname.startsWith("/en/login") ||
    pathname.startsWith("/ar/login") ||
    pathname.startsWith("/api/auth/") ||
    // Landing pages
    pathname === "/" ||
    pathname === "/en" ||
    pathname === "/ar" ||
    // Public feature pages (no account needed)
    pathname.startsWith("/en/cost-engine") ||
    pathname.startsWith("/ar/cost-engine") ||
    pathname.startsWith("/en/readiness") ||
    pathname.startsWith("/ar/readiness") ||
    // Property browsing — publicly viewable
    pathname.startsWith("/en/properties/") ||
    pathname.startsWith("/ar/properties/") ||
    pathname.startsWith("/en/property/") ||
    pathname.startsWith("/ar/property/") ||
    pathname.startsWith("/en/compare") ||
    pathname.startsWith("/ar/compare");

  // If no session and trying a protected route → redirect to login.
  // Bypass in development_headers mode
  if (!session && !isPublic && process.env.IDENTITY_MODE !== "development_headers") {
    const loginUrl = request.nextUrl.clone();
    // Preserve the locale for the login redirect
    const locale = pathname.startsWith("/ar/") ? "ar" : "en";
    loginUrl.pathname = `/${locale}/login`;
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Set RAMA proxy cookies from the session JWT so the API proxy
  // route handlers can forward them to NestJS.
  if (session?.access_token) {
    const secure = request.nextUrl.protocol === "https:";
    const cookieOpts = {
      httpOnly: true,
      secure,
      sameSite: "strict" as const,
      path: "/",
      maxAge: 3600,
    };

    // All authenticated users get a customer token.
    supabaseResponse.cookies.set(
      "__Host-rama-customer-token",
      session.access_token,
      { ...cookieOpts, secure: true },
    );

    // Staff/advisors also get an advisor token.
    if (isAdvisor) {
      supabaseResponse.cookies.set(
        "__Host-rama-advisor-token",
        session.access_token,
        { ...cookieOpts, secure: true },
      );
    }

    // Operations token for staff/admin.
    if (isStaff) {
      supabaseResponse.cookies.set(
        "__Host-rama-operations-token",
        session.access_token,
        { ...cookieOpts, secure: true },
      );
    }
  } else {
    // Clear proxy cookies on logout.
    for (const cookie of [
      "__Host-rama-customer-token",
      "__Host-rama-advisor-token",
      "__Host-rama-operations-token",
    ]) {
      supabaseResponse.cookies.set(cookie, "", { maxAge: 0, path: "/" });
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static assets)
     * - _next/image  (image optimisation)
     * - favicon.ico
     * - public files (.svg, .png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
