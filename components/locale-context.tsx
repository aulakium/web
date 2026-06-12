"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { type Locale, translator } from "@/lib/i18n";

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
  const [locale, setLocale] = useState<Locale>(initial);
  const value = useMemo(
    () => ({ locale, setLocale, t: translator(locale) }),
    [locale],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLocale debe usarse dentro de <LocaleProvider>");
  return ctx;
}
