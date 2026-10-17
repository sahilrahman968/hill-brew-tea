"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import AuthBackdrop from "@/components/store/AuthBackdrop";
import {
  clearAdminSession,
  hasAdminSession,
  setAdminSession,
  validateAdminCredentials,
} from "@/lib/admin-auth";
import { getAdminThemeCSSVariables } from "@/config/theme";

const adminThemeVars = getAdminThemeCSSVariables();

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hasAdminSession()) {
      window.location.replace("/admin/products");
      return;
    }
    setChecking(false);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!validateAdminCredentials(email, password)) {
      clearAdminSession();
      setError("Invalid email or password");
      setSubmitting(false);
      return;
    }

    setAdminSession();
    window.location.replace("/admin/products");
  };

  if (checking) {
    return (
      <div
        className="admin-theme flex min-h-screen items-center justify-center bg-admin-canvas text-sm text-admin-muted"
        style={adminThemeVars as React.CSSProperties}
        role="status"
        aria-live="polite"
      >
        Checking admin session…
      </div>
    );
  }

  return (
    <AuthBackdrop>
      <main
        className="admin-theme rounded-2xl border border-admin-line bg-admin-surface p-6 shadow-2xl shadow-admin-heading/10 sm:p-8"
        style={adminThemeVars as React.CSSProperties}
      >
        <div className="mb-7 text-center">
          <div className="relative mx-auto mb-5 h-9 w-[10rem] overflow-hidden">
            <Image
              src="/logo.svg"
              alt="Hill Brew Tea"
              fill
              sizes="160px"
              className="object-contain"
              priority
            />
          </div>
          <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl border border-admin-line bg-admin-primary-soft text-admin-primary">
            <LockKeyhole aria-hidden="true" className="size-5" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-admin-heading">
            Admin sign in
          </h1>
          <p className="mt-1.5 text-sm text-admin-muted">
            Sign in with your admin email and password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-1.5 block text-sm font-medium text-admin-body"
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-admin-line bg-admin-canvas px-3 py-2.5 text-sm text-admin-heading outline-none placeholder:text-admin-faint focus:border-admin-primary focus:ring-2 focus:ring-admin-focus"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-sm font-medium text-admin-body"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-admin-line bg-admin-canvas px-3 py-2.5 text-sm text-admin-heading outline-none placeholder:text-admin-faint focus:border-admin-primary focus:ring-2 focus:ring-admin-focus"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-lg border border-admin-danger-line bg-admin-danger-soft p-3 text-sm text-admin-danger"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex min-h-11 w-full items-center justify-center rounded-lg bg-admin-primary px-4 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-focus disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 flex items-start gap-2 border-t border-admin-line pt-5 text-xs text-admin-muted">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-admin-faint" />
          <p>Access is restricted to authorized admin accounts.</p>
        </div>
      </main>
    </AuthBackdrop>
  );
}
