import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <a href="/">
          <Image
            src="/assets/images/logo/logo-transparent-slim.png"
            alt="Kloot"
            height={20}
            width={80}
            className="h-5 w-auto object-contain"
            style={{ height: 20, width: "auto" }}
          />
        </a>
        <div className="flex items-center gap-6">
          <a href="/o/about" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            About
          </a>
          <a href="/o/pricing" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Pricing
          </a>
          <a href="/o/privacy" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Privacy
          </a>
          <a href="/o/terms" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Terms
          </a>
          <a href="/o/data-deletion" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Data Deletion
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://instagram.com/kloot.io"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kloot on Instagram"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
          <p className="text-xs text-gray-400">© 2026 Kloot</p>
        </div>
      </div>
    </footer>
  );
}
