import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sample Creator Media Kit | Kloot",
  description: "See what a Kloot creator media kit looks like — stats, content, packages, and collaboration rates all in one beautiful shareable link.",
  robots: { index: false },
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm text-white text-center py-2.5 px-4">
        <p className="text-xs">
          This is a sample kloot media kit ·{" "}
          <Link href="/app/onboarding" className="underline underline-offset-2 font-semibold">
            Create yours →
          </Link>
        </p>
      </div>
    </div>
  );
}
