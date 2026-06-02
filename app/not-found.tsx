import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[120px] font-black leading-none text-gray-900 opacity-10 select-none mb-0">
        404
      </p>
      <div className="-mt-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page not found
        </h1>
        <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-gray-700 transition-colors"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
