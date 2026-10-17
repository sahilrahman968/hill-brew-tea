import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/components/store/Toast";
import ScrollbarOverlay from "@/components/ScrollbarOverlay";
import { theme, getThemeCSSVariables } from "@/config/theme";

// ── Font imports ─────────────────────────────────────────────────────────────
// Storefront: Outfit (body) + Cormorant Garamond (display) — keep theme.ts in sync.
// Admin: Inter only, remapped under `.admin-theme` / `html.admin-panel` in globals.css.

const bodyFont = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const displayFont = Cormorant_Garamond({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const adminBodyFont = Inter({
  variable: "--font-admin-body",
  subsets: ["latin"],
  display: "swap",
});

// ── Metadata (reads from theme config) ───────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: `${theme.brand.name} - ${theme.brand.tagline}`,
    template: `%s | ${theme.brand.name}`,
  },
  description: theme.brand.description,
  keywords: [...theme.brand.keywords],
};

// ── Theme CSS variables ──────────────────────────────────────────────────────

const themeVars: Record<string, string> = {
  ...getThemeCSSVariables(),
  "--heading-letter-spacing": theme.headings.letterSpacing,
  "--heading-text-transform": theme.headings.textTransform,
};

// ── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} ${adminBodyFont.variable} antialiased`}
        style={themeVars as React.CSSProperties}
      >
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              {children}
              <ScrollbarOverlay />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
