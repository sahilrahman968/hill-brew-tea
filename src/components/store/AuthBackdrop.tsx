"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { theme } from "@/config/theme";

const AUTH_BANNER_SRC = "/images/estate/hero-garden.jpg";

export default function AuthBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-12 pt-28">
      <motion.div
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0"
      >
        <Image
          src={AUTH_BANNER_SRC}
          alt=""
          fill
          sizes="100vw"
          className="object-cover animate-hero-slow-zoom"
          priority
        />
      </motion.div>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,18,12,0.88)_0%,rgba(10,18,12,0.5)_45%,rgba(10,18,12,0.8)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c1410] via-transparent to-black/45" />

      <div className="relative w-full max-w-md border border-border/60 bg-card/55 p-6 backdrop-blur-md sm:p-8">
        <p className="mb-1 text-center font-display text-3xl text-foreground">
          {theme.brand.name}
        </p>
        <p className="mb-6 text-center text-sm text-muted">
          Sign in with WhatsApp to order estate-fresh Assam tea
        </p>
        {children}
      </div>
    </div>
  );
}
