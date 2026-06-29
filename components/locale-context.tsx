"use client";

import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { type Locale, translator, LOCALE_COOKIE } from "@/lib/i18n";

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const Ctx = createContext<LocaleCtx | null>(null);

export function LocaleProvider({
  children,
  initial = "es-AR",
}: {
  children: React.ReactNode;
  initial?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initial);

  // Persistimos la elección en una cookie para que se mantenga al navegar.
  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof document !== "undefined") {
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    }
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, t: translator(locale) }),
    [locale, setLocale],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLocale debe usarse dentro de <LocaleProvider>");
  return ctx;
}
