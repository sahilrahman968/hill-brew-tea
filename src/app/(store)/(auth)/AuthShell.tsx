"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/store/Toast";
import AuthBackdrop from "@/components/store/AuthBackdrop";
import OtpInput from "@/components/store/OtpInput";
import PhoneInput from "@/components/store/PhoneInput";
import type { SupportedCountry } from "@/types";
import { getLocalPhoneDigits } from "@/lib/addresses/phone";

type AuthStep = "enter-phone" | "enter-otp" | "enter-name";

const AUTH_COUNTRY: SupportedCountry = "IN";

export default function AuthShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { sendOtp, verifyOtp, isAuthenticated, isLoading: authLoading } =
    useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<AuthStep>("enter-phone");
  const [phone, setPhone] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(redirect);
    }
  }, [isAuthenticated, authLoading, router, redirect]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendOtp = useCallback(async () => {
    setError("");
    const localDigits = getLocalPhoneDigits(phone, AUTH_COUNTRY);
    if (localDigits.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    const res = await sendOtp(phone);
    if (res.success) {
      setNormalizedPhone(res.phone || phone);
      setStep("enter-otp");
      setCooldown(60);
      toast("OTP sent via WhatsApp!", "success");
    } else {
      setError(res.message);
    }
    setLoading(false);
  }, [phone, sendOtp, toast]);

  const handleVerifyOtp = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setError("");

      if (!otp || otp.length !== 6) {
        setError("Please enter the 6-digit OTP");
        return;
      }

      setLoading(true);
      const res = await verifyOtp(normalizedPhone, otp);
      if (res.success && res.needsName) {
        setStep("enter-name");
        toast("New number — tell us your name to finish", "info");
      } else if (res.success && res.user) {
        toast("Welcome!", "success");
        router.replace(redirect);
      } else {
        setError(res.message);
      }
      setLoading(false);
    },
    [otp, normalizedPhone, verifyOtp, toast, router, redirect]
  );

  const handleCompleteRegistration = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!name.trim() || name.trim().length < 2) {
        setError("Please enter your name");
        return;
      }
      if (!otp || otp.length !== 6) {
        setError("Please enter the 6-digit OTP");
        return;
      }

      setLoading(true);
      const res = await verifyOtp(normalizedPhone, otp, name.trim());
      if (res.success && res.user) {
        toast("Account created!", "success");
        router.replace(redirect);
      } else if (res.success && res.needsName) {
        setError("Please provide your name");
      } else {
        setError(res.message);
      }
      setLoading(false);
    },
    [name, otp, normalizedPhone, verifyOtp, toast, router, redirect]
  );

  if (authLoading) return null;

  return (
    <AuthBackdrop>
      <div className="auth-form">
        {error && (
          <div className="mb-4 rounded-lg border border-danger/25 bg-danger/10 p-3 text-sm leading-relaxed text-danger animate-slide-up">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {step === "enter-phone" && (
            <motion.div
              key="enter-phone"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <PhoneInput
                country={AUTH_COUNTRY}
                value={phone}
                onChange={setPhone}
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || getLocalPhoneDigits(phone, AUTH_COUNTRY).length < 10}
                className="flex w-full items-center justify-center gap-2 bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Send OTP on WhatsApp"
                )}
              </button>
            </motion.div>
          )}

          {step === "enter-otp" && (
            <motion.form
              key="enter-otp"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleVerifyOtp}
              className="space-y-4"
            >
              <button
                type="button"
                onClick={() => {
                  setStep("enter-phone");
                  setOtp("");
                  setError("");
                }}
                className="mb-1 flex items-center gap-1 text-sm text-muted hover:text-foreground"
              >
                <ArrowLeft size={14} />
                Change number
              </button>

              <p className="text-sm text-muted">
                Enter the 6-digit OTP sent via WhatsApp to{" "}
                <span className="font-medium text-foreground">
                  {normalizedPhone}
                </span>
              </p>

              <OtpInput value={otp} onChange={setOtp} disabled={loading} />

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="flex w-full items-center justify-center gap-2 bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Verify & Sign In"
                )}
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={cooldown > 0 || loading}
                className="w-full text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
              </button>
            </motion.form>
          )}

          {step === "enter-name" && (
            <motion.form
              key="enter-name"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleCompleteRegistration}
              className="space-y-4"
            >
              <button
                type="button"
                onClick={() => {
                  setStep("enter-otp");
                  setError("");
                }}
                className="mb-1 flex items-center gap-1 text-sm text-muted hover:text-foreground"
              >
                <ArrowLeft size={14} />
                Back
              </button>

              <p className="text-sm text-muted">
                Almost done — what should we call you?
              </p>

              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  autoFocus
                  disabled={loading}
                  className="w-full border border-border bg-black/55 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || name.trim().length < 2}
                className="flex w-full items-center justify-center gap-2 bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "Create account"
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </AuthBackdrop>
  );
}
