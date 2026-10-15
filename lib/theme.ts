import type { CSSProperties } from "react";
import type { HeadingFont, StoreSettings } from "@/lib/settings";

const headingFontVars: Record<HeadingFont, string> = {
  cormorant: "var(--font-cormorant)",
  playfair: "var(--font-playfair)",
  fraunces: "var(--font-fraunces)",
  geist: "var(--font-geist-sans)",
};

/** Variabel CSS untuk warna & font toko (dipakai toko dan pratinjau admin). */
export function themeStyle(settings: Pick<StoreSettings, "colors" | "fonts">): CSSProperties {
  const c = settings.colors;
  return {
    "--c-bg": c.background,
    "--c-surface": c.surface,
    "--c-surface-strong": c.surfaceStrong,
    "--c-line": c.border,
    "--c-ink": c.text,
    "--c-ink-muted": c.textMuted,
    "--c-accent": c.accent,
    "--c-primary": c.primary,
    "--c-on-primary": c.primaryText,
    "--c-footer": c.footer,
    "--c-on-footer": c.footerText,
    "--heading-font": headingFontVars[settings.fonts.heading],
  } as CSSProperties;
}
