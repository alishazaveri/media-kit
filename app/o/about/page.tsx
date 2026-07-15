import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Kloot",
  description: "Learn about Kloot — the platform that helps creators build stunning media kits and attract brand deals effortlessly.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-500 text-sm leading-relaxed">{children}</p>;
}

export default function AboutPage() {
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
            href="/app/onboarding"
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Sign up →
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">About Kloot</h1>
          <p className="text-sm text-gray-400">The creator&rsquo;s media kit, built for the modern era</p>
        </div>

        <Para>
          Kloot is a platform built for creators who are serious about collaborations. We give you a
          beautiful, always-live media kit at your own{" "}
          <span className="font-medium text-gray-700">kloot.io/handle</span> link — packed with your
          real Instagram analytics, audience insights, and collaboration packages, so you can pitch
          brands with confidence.
        </Para>

        <div className="my-8 border-t border-gray-100" />

        <Section title="Our Mission">
          <Para>
            We believe every creator deserves a professional presence without spending hours building
            decks. Our mission is to make it effortless for creators to showcase their value, connect
            with the right brands, and grow their income.
          </Para>
        </Section>

        <Section title="What We Offer">
          <Para>Kloot gives creators everything they need to collaborate professionally:</Para>
          <ul className="mt-3 space-y-2">
            {[
              "A unique kloot.io link that is your always-updated media kit",
              "Live Instagram analytics pulled directly from your account",
              "Audience insights — demographics, reach, engagement rate",
              "Customizable collaboration packages with your rates",
              "7 beautiful themes to match your personal brand",
              "One simple subscription, cancel anytime",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-gray-500 leading-relaxed">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                  <path
                    d="M3 8L6.5 11.5L13 5"
                    stroke="#ff7350"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Our Story">
          <Para>
            Kloot was born out of a simple frustration: creators spend too much time building PDFs and
            slide decks that go stale the moment they&rsquo;re sent. Meanwhile, brands struggle to
            trust numbers they can&rsquo;t verify.
          </Para>
          <div className="mt-3">
            <Para>
              We set out to build a living media kit — one that pulls real data, stays current
              automatically, and looks great on any device. The result is Kloot: a home for your
              creator profile that works as hard as you do.
            </Para>
          </div>
        </Section>

        <Section title="Built for Indian Creators">
          <Para>
            We are a team based in India, building specifically for the Indian creator ecosystem. Our
            pricing is designed to be accessible, our analytics are tuned for Instagram — the primary
            platform for Indian creators — and we are constantly iterating based on feedback from
            creators like you.
          </Para>
        </Section>

        <Section title="The Company Behind Kloot">
          <Para>
            Kloot is a product of{" "}
            <a
              href="https://tysonimedia.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-700 hover:text-primary transition-colors"
            >
              Tysoni Media
            </a>
            , an influencer marketing agency that works closely with creators and brands every day.
            That hands-on experience is what shaped Kloot — we built the tool we wished existed when
            putting together creator pitches and brand briefs.
          </Para>
        </Section>

        <Section title="Get in Touch">
          <Para>
            Questions, feedback, or partnership inquiries? We&rsquo;d love to hear from you. Reach us
            at{" "}
            <a href="mailto:support@kloot.io" className="text-primary hover:underline">
              support@kloot.io
            </a>
            .
          </Para>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-xs text-gray-400">© 2026 Kloot</p>
          <div className="flex items-center gap-4">
            <Link
              href="/o/terms"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/o/privacy"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
