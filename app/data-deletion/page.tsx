import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Deletion Request — Kloot",
};

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900 text-xl">
            Kloot
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Privacy Policy →
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Data Deletion Request
          </h1>
          <p className="text-sm text-gray-400">Last updated: May 9, 2026</p>
        </div>

        <div className="space-y-6 text-sm text-gray-500 leading-relaxed">
          <p>
            If you would like to delete your account and associated data from
            Kloot, please contact us at:
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5">
            <a
              href="mailto:support@kloot.io"
              className="text-teal-600 font-medium hover:underline text-base"
            >
              support@kloot.io
            </a>
          </div>

          <p>
            Include your registered email address in the message and mention
            that you want your account deleted.
          </p>

          <p>
            After verification, we will permanently delete your account and all
            associated personal data from our systems within a reasonable
            timeframe, except where retention is required by law or for security
            purposes.
          </p>

          <div className="border-t border-gray-100 pt-6">
            <p className="text-gray-400 text-xs">
              This page is required for compliance with data protection
              regulations and platform policies (e.g. Meta). For more
              information on how we handle your data, please review our{" "}
              <Link href="/privacy" className="text-teal-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-xs text-gray-400">© 2026 Kloot</p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
