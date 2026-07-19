import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * POST /api/auth/logout
 * Signs the user out and clears all RAMA proxy cookies.
 */
export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const response = NextResponse.redirect(`${origin}/en/login`);

  // Clear all RAMA proxy cookies.
  for (const name of [
    "__Host-rama-customer-token",
    "__Host-rama-advisor-token",
    "__Host-rama-operations-token",
  ]) {
    response.cookies.set(name, "", { maxAge: 0, path: "/" });
  }

  return response;
}
