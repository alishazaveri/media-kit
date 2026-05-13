export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-bold text-gray-900 text-sm">Kloot</span>
        <div className="flex items-center gap-6">
          <a href="/privacy" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Privacy
          </a>
          <a href="/terms" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Terms
          </a>
          <a href="/data-deletion" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Data Deletion
          </a>
        </div>
        <p className="text-xs text-gray-400">© 2026 Kloot</p>
      </div>
    </footer>
  );
}
