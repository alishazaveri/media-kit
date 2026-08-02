"use client";

import { createContext, useContext } from "react";
import { type Currency } from "@/lib/plans";

type LocaleValue = { country: string; currency: Currency };

const LocaleContext = createContext<LocaleValue>({ country: "", currency: "USD" });

export function LocaleProvider({ country, children }: { country: string; children: React.ReactNode }) {
  const currency: Currency = country === "IN" ? "INR" : "USD";
  return <LocaleContext.Provider value={{ country, currency }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleValue {
  return useContext(LocaleContext);
}
