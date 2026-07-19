"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function LoginForm({ locale }: { locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? `/${locale}/discover`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const supabase = createSupabaseBrowserClient();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      router.push(next as any);
      router.refresh();
    }
    setLoading(false);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Check your email for a sign-in link." });
    }
    setLoading(false);
  };

  const isAr = locale === "ar";

  return (
    <div className="login-form-container">
      <div className="login-card">
        {/* Brand mark */}
        <div className="login-brand">
          <span className="login-brand-mark">R</span>
          <span className="login-brand-name">RAMA</span>
        </div>

        <h1 className="login-heading">
          {isAr ? "تسجيل الدخول" : "Sign in to RAMA"}
        </h1>
        <p className="login-subheading">
          {isAr
            ? "منصة العقارات الموثوقة في دبي"
            : "Dubai's evidence-first real-estate platform"}
        </p>

        {/* Mode toggle */}
        <div className="login-mode-toggle" role="group" aria-label="Sign-in method">
          <button
            type="button"
            className={`login-mode-btn${mode === "password" ? " active" : ""}`}
            onClick={() => setMode("password")}
          >
            {isAr ? "كلمة المرور" : "Password"}
          </button>
          <button
            type="button"
            className={`login-mode-btn${mode === "magic" ? " active" : ""}`}
            onClick={() => setMode("magic")}
          >
            {isAr ? "رابط البريد" : "Magic link"}
          </button>
        </div>

        <form
          id="login-form"
          onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}
          className="login-fields"
          dir={isAr ? "rtl" : "ltr"}
        >
          <label className="login-label" htmlFor="login-email">
            {isAr ? "البريد الإلكتروني" : "Email address"}
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
            placeholder="name@example.com"
            disabled={loading}
          />

          {mode === "password" && (
            <>
              <label className="login-label" htmlFor="login-password">
                {isAr ? "كلمة المرور" : "Password"}
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                placeholder="••••••••"
                disabled={loading}
              />
            </>
          )}

          {message && (
            <div
              role="alert"
              className={`login-message ${message.type === "error" ? "login-message--error" : "login-message--success"}`}
            >
              {message.text}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading
              ? (isAr ? "جارٍ التحميل…" : "Please wait…")
              : mode === "password"
                ? (isAr ? "تسجيل الدخول" : "Sign in")
                : (isAr ? "إرسال الرابط" : "Send magic link")}
          </button>
        </form>

        <p className="login-footer">
          {isAr
            ? "بتسجيل دخولك، أنت توافق على سياسة الخصوصية وشروط الاستخدام."
            : "By signing in, you agree to our Privacy Policy and Terms of Use."}
        </p>
      </div>
    </div>
  );
}
