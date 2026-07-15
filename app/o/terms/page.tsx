import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions — Kloot",
  description: "Read Kloot's terms and conditions governing the use of our platform and services.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
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

export default function TermsPage() {
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
            href="/o/privacy"
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            Privacy Policy →
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Terms &amp; Conditions</h1>
          <p className="text-sm text-gray-400">Last updated: May 9, 2026</p>
        </div>

        <Para>
          These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to and use of Kloot
          and related services. By using our Services, you agree to these Terms.
        </Para>

        <div className="my-8 border-t border-gray-100" />

        <Section title="1. Eligibility">
          <Para>
            You must be at least 13 years old to use our Services. By using the platform, you
            represent that you meet this requirement.
          </Para>
        </Section>

        <Section title="2. User Accounts">
          <Para>You are responsible for:</Para>
          <List
            items={[
              "Maintaining the confidentiality of your account",
              "Providing accurate information",
              "All activities conducted under your account",
            ]}
          />
          <div className="mt-3">
            <Para>
              We reserve the right to suspend or terminate accounts violating these Terms.
            </Para>
          </div>
        </Section>

        <Section title="3. Platform Services">
          <Para>Our platform may provide:</Para>
          <List
            items={[
              "Creator media kits",
              "Creator analytics",
              "Brand collaboration tools",
              "Campaign management",
              "Social account integrations",
              "Marketplace features",
            ]}
          />
          <div className="mt-3">
            <Para>We may modify or discontinue features at any time.</Para>
          </div>
        </Section>

        <Section title="4. User Content">
          <Para>
            You retain ownership of content you upload or connect through social platforms. By using
            the Services, you grant us a limited license to:
          </Para>
          <List
            items={[
              "Display your content",
              "Generate analytics",
              "Create media kits",
              "Facilitate collaborations",
            ]}
          />
          <div className="mt-3">
            <Para>You are solely responsible for content you submit.</Para>
          </div>
        </Section>

        <Section title="5. Prohibited Activities">
          <Para>Users may not:</Para>
          <List
            items={[
              "Violate laws or regulations",
              "Impersonate others",
              "Upload harmful or malicious content",
              "Attempt unauthorized access",
              "Abuse APIs or platform systems",
              "Scrape or copy platform data",
              "Use the platform for spam or fraud",
            ]}
          />
        </Section>

        <Section title="6. Intellectual Property">
          <Para>
            All platform content, branding, software, designs, and technology belong to us unless
            otherwise stated. You may not reproduce, distribute, or reverse engineer any part of the
            platform without permission.
          </Para>
        </Section>

        <Section title="7. Third-Party Platforms">
          <Para>
            Our Services may integrate with platforms like Instagram, YouTube, TikTok, and others.
            We are not responsible for:
          </Para>
          <List
            items={[
              "Third-party platform outages",
              "API limitations",
              "Policy changes",
              "Data inaccuracies originating from third parties",
            ]}
          />
        </Section>

        <Section title="8. Payments & Transactions">
          <Para>If applicable:</Para>
          <List
            items={[
              "Payments may be processed through third-party providers",
              "Fees may apply to subscriptions or collaborations",
              "Refund policies will be specified separately",
            ]}
          />
          <div className="mt-3">
            <Para>
              We are not liable for disputes between brands and creators unless explicitly stated.
            </Para>
          </div>
        </Section>

        <Section title="9. Disclaimer">
          <Para>
            Services are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
            warranties of any kind. We do not guarantee:
          </Para>
          <List
            items={[
              "Uninterrupted availability",
              "Specific business outcomes",
              "Collaboration success",
              "Accuracy of third-party analytics",
            ]}
          />
        </Section>

        <Section title="10. Limitation of Liability">
          <Para>
            To the maximum extent permitted by law, we shall not be liable for:
          </Para>
          <List
            items={[
              "Indirect damages",
              "Lost profits",
              "Data loss",
              "Business interruption",
              "Platform downtime",
            ]}
          />
        </Section>

        <Section title="11. Termination">
          <Para>
            We may suspend or terminate access to the platform at our discretion if users violate
            these Terms or misuse the Services.
          </Para>
        </Section>

        <Section title="12. Governing Law">
          <Para>
            These Terms shall be governed by the laws applicable in your jurisdiction.
          </Para>
        </Section>

        <Section title="13. Changes to Terms">
          <Para>
            We may update these Terms from time to time. Continued use of the Services after updates
            constitutes acceptance of the revised Terms.
          </Para>
        </Section>

        <Section title="14. Contact Information">
          <Para>
            For questions regarding these Terms, contact us at{" "}
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
          <Link
            href="/o/privacy"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
