import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Kloot",
  description: "Simple, transparent pricing for creators. Choose a plan and start attracting brand deals with your Kloot media kit.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
