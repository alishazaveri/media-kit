"use client";

import { SWRConfig } from "swr";
import axios from "axios";

const fetcher = (url: string) => axios.get(url).then((r) => r.data);

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return <SWRConfig value={{ fetcher }}>{children}</SWRConfig>;
}
