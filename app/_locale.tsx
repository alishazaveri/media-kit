import { headers } from "next/headers";
import { LocaleProvider } from "@/contexts/LocaleContext";

export async function LocaleServer({ children }: { children: React.ReactNode }) {
  const country = (await headers()).get("x-kloot-country") ?? "";
  return <LocaleProvider country={country}>{children}</LocaleProvider>;
}
