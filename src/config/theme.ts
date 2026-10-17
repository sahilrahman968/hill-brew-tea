// ─── Global Theme Configuration ─────────────────────────────────────────────
// This is the single source of truth for the website's visual identity.
// Change values here and they propagate across the entire site.
//
// FONTS: Body & display fonts are imported via next/font/google in layout.tsx.
//        To swap fonts, update the imports there AND the font variable names below.

export const theme = {
  // ── Brand ──────────────────────────────────────────────────────────────────
  brand: {
    name: "Hill Brew Tea",
    tagline: "Assam Tea, Straight from the Estate",
    description:
      "Single-origin Assam tea from misty Brahmaputra valley gardens. Hand-picked leaves, small-batch craft, and a cup that tastes of the hills.",
    keywords: [
      "Assam tea",
      "Hill Brew Tea",
      "Hill Brew",
      "premium tea",
      "single origin",
      "tea estate",
      "Assamese tea",
      "black tea",
    ],
    supportEmail: "hello@hillbrew.tea",
    supportPhone: "+91 98765 43210",
    supportHours: "Mon - Sat, 9am - 6pm",
    location: "Jorhat, Assam, India",
  },

  // ── Colors ─────────────────────────────────────────────────────────────────
  // Deep Assam estate greens with warm brass / tea-liquor accents.
  // Avoids flat purple gradients and generic cream-terracotta AI looks.
  colors: {
    background: "#0f1712",
    foreground: "#f3efe4",
    primary: "#c9a227",
    primaryDark: "#8f7318",
    primaryLight: "#1e2b20",
    accent: "#5f8a63",
    accentLight: "#1a2820",
    muted: "#a8a294",
    border: "#2a352c",
    card: "#152019",
    cardHover: "#1c2a21",
    danger: "#d45a5a",
    warning: "#d4a24a",
    success: "#6aad7a",
  },

  // ── Admin panel colors ─────────────────────────────────────────────────────
  // Independent indigo / slate scale for the light admin work surface.
  // Never reuse storefront brand colors here — they are tuned for a dark page.
  // Applied only under `.admin-theme` / `html.admin-panel` (see getAdminThemeCSSVariables)
  // and exposed as Tailwind utilities (bg-admin-surface, text-admin-muted, …).
  adminColors: {
    canvas: "#F8FAFC",
    surface: "#FFFFFF",
    subtle: "#F1F5F9",
    hover: "#F1F5F9",
    line: "#E2E8F0",
    lineStrong: "#CBD5E1",
    heading: "#0F172A",
    body: "#334155",
    muted: "#64748B",
    faint: "#94A3B8",
    primary: "#4F46E5",
    primaryHover: "#4338CA",
    primarySoft: "#EEF2FF",
    focus: "#A5B4FC",
    success: "#10B981",
    successSoft: "#ECFDF5",
    successLine: "#A7F3D0",
    warning: "#F59E0B",
    warningSoft: "#FFFBEB",
    warningLine: "#FDE68A",
    danger: "#EF4444",
    dangerSoft: "#FEF2F2",
    dangerLine: "#FECACA",
    info: "#3B82F6",
    infoSoft: "#EFF6FF",
    infoLine: "#BFDBFE",
  },

  // ── Fonts ──────────────────────────────────────────────────────────────────
  // body    = Outfit — clean, contemporary, high legibility
  // display = Cormorant Garamond — estate-era serif for brand & headlines
  fonts: {
    body: "var(--font-body)",
    display: "var(--font-display-face)",
  },

  // ── Headings ───────────────────────────────────────────────────────────────
  // Serif display titles read better without forced uppercase.
  headings: {
    letterSpacing: "-0.01em",
    textTransform: "none" as const,
  },

  // ── Announcement Bar ───────────────────────────────────────────────────────
  announcement: {
    enabled: false,
    text: "Free shipping over ₹999 · Estate-fresh Assam tea",
  },
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Converts the camelCase color keys to kebab-case CSS custom property names */
function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}

/** Storefront CSS variables only — admin tokens must not land on the store body. */
export function getThemeCSSVariables(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme.colors)) {
    vars[`--${camelToKebab(key)}`] = value;
  }
  return vars;
}

/** Admin CSS variables — apply on `.admin-theme` / `html.admin-panel` only. */
export function getAdminThemeCSSVariables(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme.adminColors)) {
    vars[`--admin-${camelToKebab(key)}`] = value;
  }
  return vars;
}

export type Theme = typeof theme;
