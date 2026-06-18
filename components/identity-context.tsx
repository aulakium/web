"use client";

import { createContext, useContext } from "react";
import type { Identity } from "@/lib/identity";

const IdentityContext = createContext<Identity | null>(null);

export function IdentityProvider({
  value,
  children,
}: {
  value: Identity | null;
  children: React.ReactNode;
}) {
  return (
    <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>
  );
}

/** Identidad del usuario logueado (o null si no resolvió). */
export function useIdentity() {
  return useContext(IdentityContext);
}
