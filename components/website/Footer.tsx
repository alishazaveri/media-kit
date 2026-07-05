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
        <p className="text-xs text-gray-400">© 2026 Kloot</p>
      </div>
    </footer>
  );
}
