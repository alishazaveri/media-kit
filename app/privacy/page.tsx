import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Kloot",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold text-gray-800 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-1 text-gray-500 text-sm leading-relaxed">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-500 text-sm leading-relaxed">{children}</p>;
}

export default function PrivacyPage() {
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
            href="/terms"
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Terms &amp; Conditions →
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: May 9, 2026</p>
        </div>

        <Para>
          Welcome to Kloot (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). This Privacy
          Policy explains how we collect, use, disclose, and protect your information when you use
          our platform, website, applications, and related services (&ldquo;Services&rdquo;).
        </Para>
        <Para>By using our Services, you agree to the practices described in this Privacy Policy.</Para>

        <div className="my-8 border-t border-gray-100" />

        <Section title="1. Information We Collect">
          <Sub title="a. Information You Provide">
            <Para>We may collect information you voluntarily provide, including:</Para>
            <List
              items={[
                "Name",
                "Email address",
                "Username or social media handles",
                "Profile information",
                "Brand and creator collaboration details",
              ]}
            />
          </Sub>
          <Sub title="b. Social Media Data">
            <Para>
              When you connect your social accounts (such as Instagram, YouTube, TikTok, etc.), we
              may collect:
            </Para>
            <List
              items={[
                "Public profile information",
                "Follower count",
                "Engagement metrics",
                "Analytics and insights",
                "Audience demographics",
                "Media performance data",
              ]}
            />
            <div className="mt-2">
              <Para>
                This data is collected only with your authorization and according to the policies of
                the connected platform.
              </Para>
            </div>
          </Sub>
          <Sub title="c. Automatically Collected Information">
            <Para>We may automatically collect:</Para>
            <List
              items={[
                "Device information",
                "Browser type",
                "IP address",
                "Usage activity",
                "Cookies and tracking data",
                "Log data",
              ]}
            />
          </Sub>
        </Section>

        <Section title="2. How We Use Your Information">
          <Para>We use collected information to:</Para>
          <List
            items={[
              "Provide and improve our Services",
              "Generate creator media kits",
              "Match creators with brands",
              "Display analytics and performance insights",
              "Process payments and collaborations",
              "Communicate with users",
              "Detect fraud, abuse, or security issues",
              "Comply with legal obligations",
            ]}
          />
        </Section>

        <Section title="3. Sharing of Information">
          <Para>We may share information:</Para>
          <List
            items={[
              "With brands or creators involved in collaborations",
              "With service providers and infrastructure partners",
              "When required by law",
              "During mergers, acquisitions, or business transfers",
            ]}
          />
          <div className="mt-3">
            <Para>We do not sell your personal information to third parties.</Para>
          </div>
        </Section>

        <Section title="4. Cookies & Tracking Technologies">
          <Para>We use cookies and similar technologies to:</Para>
          <List
            items={[
              "Keep users logged in",
              "Analyze platform usage",
              "Improve user experience",
              "Personalize content",
            ]}
          />
          <div className="mt-3">
            <Para>
              You may disable cookies through your browser settings, though some features may not
              function properly.
            </Para>
          </div>
        </Section>

        <Section title="5. Data Security">
          <Para>
            We implement reasonable security measures to protect your information. However, no method
            of transmission or storage is completely secure, and we cannot guarantee absolute
            security.
          </Para>
        </Section>

        <Section title="6. Third-Party Services">
          <Para>
            Our Services may integrate with third-party platforms including social media providers,
            payment gateways, analytics services, and cloud providers. Your use of those services may
            also be governed by their respective privacy policies.
          </Para>
        </Section>

        <Section title="7. Data Retention">
          <Para>We retain information for as long as necessary to:</Para>
          <List
            items={[
              "Provide Services",
              "Maintain legal compliance",
              "Resolve disputes",
              "Enforce agreements",
            ]}
          />
          <div className="mt-3">
            <Para>You may request deletion of your account and associated data.</Para>
          </div>
        </Section>

        <Section title="8. Your Rights">
          <Para>Depending on your location, you may have rights to:</Para>
          <List
            items={[
              "Access your data",
              "Correct inaccurate data",
              "Request deletion",
              "Withdraw consent",
              "Request export of your information",
            ]}
          />
          <div className="mt-3">
            <Para>
              To exercise these rights, contact us at{" "}
              <a
                href="mailto:support@kloot.io"
                className="text-primary hover:underline"
              >
                support@kloot.io
              </a>
              .
            </Para>
          </div>
        </Section>

        <Section title="9. Children's Privacy">
          <Para>
            Our Services are not intended for individuals under the age of 13. We do not knowingly
            collect personal information from children.
          </Para>
        </Section>

        <Section title="10. Changes to This Policy">
          <Para>
            We may update this Privacy Policy from time to time. Changes will be posted on this page
            with an updated revision date.
          </Para>
        </Section>

        <Section title="11. Contact Us">
          <Para>
            If you have any questions regarding this Privacy Policy, contact us at{" "}
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
          <div className="flex items-center gap-6">
            <Link
              href="/data-deletion"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Data Deletion
            </Link>
            <Link
              href="/terms"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
