import type { Metadata } from "next";
import Image from "next/image";
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
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/images/logo/logo-transparent-slim.png"
              alt="Kloot"
              height={28}
              width={80}
              className="h-7 w-auto object-contain"
            />
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
            Delete Your Account & Data
          </h1>
          <p className="text-sm text-gray-400">Last updated: May 9, 2026</p>
        </div>

        <div className="space-y-10 text-sm text-gray-500 leading-relaxed">
          <p>
            You can permanently delete your Kloot account and all associated
            data at any time. Choose the method that works best for you.
          </p>

          {/* Option 1: Self-service */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-primary text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Recommended
              </span>
              <h2 className="text-base font-bold text-gray-900">
                Delete directly from your account
              </h2>
            </div>

            <p className="mb-5">
              The fastest way to delete your account and data is through your
              account settings — no waiting, instant and permanent.
            </p>

            <ol className="space-y-4">
              {[
                {
                  step: "1",
                  title: "Log in to Kloot",
                  detail: (
                    <>
                      Go to{" "}
                      <Link
                        href="/login"
                        className="text-primary hover:underline"
                      >
                        kloot.io/login
                      </Link>{" "}
                      and sign in to your account.
                    </>
                  ),
                },
                {
                  step: "2",
                  title: "Open Account Settings",
                  detail: (
                    <>
                      Click your profile picture in the top-right corner, then
                      select{" "}
                      <Link
                        href="/account"
                        className="text-primary hover:underline"
                      >
                        Account
                      </Link>
                      .
                    </>
                  ),
                },
                {
                  step: "3",
                  title: "Open Advanced Settings",
                  detail:
                    'Scroll to the bottom of the page and click "Advanced settings" to expand the section.',
                },
                {
                  step: "4",
                  title: "Delete your account",
                  detail:
                    'Click the "Delete" button next to "Delete account and data". You\'ll be asked to confirm before anything is deleted.',
                },
                {
                  step: "5",
                  title: "Done",
                  detail:
                    "Your account and all associated data — including profile info, connected social accounts, and analytics — will be permanently removed immediately.",
                },
              ].map(({ step, title, detail }) => (
                <li key={step} className="flex gap-4">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-gray-100 text-gray-500 font-semibold text-xs flex items-center justify-center">
                    {step}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800">{title}</p>
                    <p className="text-gray-500 mt-0.5">{detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-gray-100" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              or
            </span>
            <div className="flex-1 border-t border-gray-100" />
          </div>

          {/* Option 2: Email */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Request deletion by email
            </h2>

            <p className="mb-4">
              If you no longer have access to your account, contact us and
              we&apos;ll delete your data manually after verification.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5">
              <a
                href="mailto:support@kloot.io"
                className="text-primary font-medium hover:underline text-base"
              >
                support@kloot.io
              </a>
            </div>

            <p className="mt-4">
              Include your registered email address and mention that you want
              your account and data deleted. After verification, we will
              permanently delete everything within a reasonable timeframe,
              except where retention is required by law or for security
              purposes.
            </p>
          </div>

          {/* <div className="border-t border-gray-100 pt-6">
            <p className="text-gray-400 text-xs">
              This page is required for compliance with data protection
              regulations and platform policies (e.g. Meta). For more
              information on how we handle your data, please review our{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div> */}
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
