import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { LoginForm } from "@/features/auth/components/login-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sign in — RAMA",
  description: "Sign in to RAMA, Dubai's evidence-first real-estate platform.",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();

  // Already signed in — redirect away.
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session) redirect(`/${value}/discover`);

  const { error } = await searchParams;

  return (
    <main className="login-page" lang={value} dir={value === "ar" ? "rtl" : "ltr"}>
      {error && (
        <div role="alert" className="login-global-error">
          {error === "auth_callback_failed"
            ? "Sign-in link has expired. Please try again."
            : "An error occurred. Please try again."}
        </div>
      )}
      <LoginForm locale={value} />
    </main>
  );
}
