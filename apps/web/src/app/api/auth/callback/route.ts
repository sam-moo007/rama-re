import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * GET /api/auth/callback
 *
 * Supabase redirects here after OAuth or magic-link sign-in.
 * Exchanges the ?code= param for a session, then redirects to
 * the original destination (or /en/discover).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/en/discover";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Exchange failed — redirect back to login with an error hint.
  return NextResponse.redirect(`${origin}/en/login?error=auth_callback_failed`);
}
