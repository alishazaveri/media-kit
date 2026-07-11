"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";

const NAV = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="1.5" stroke={active ? "black" : "#6B7280"} strokeWidth="1.5" />
        <rect x="10" y="2" width="6" height="6" rx="1.5" stroke={active ? "black" : "#6B7280"} strokeWidth="1.5" />
        <rect x="2" y="10" width="6" height="6" rx="1.5" stroke={active ? "black" : "#6B7280"} strokeWidth="1.5" />
        <rect x="10" y="10" width="6" height="6" rx="1.5" stroke={active ? "black" : "#6B7280"} strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6" r="3" stroke={active ? "black" : "#6B7280"} strokeWidth="1.5" />
        <path d="M2 16c0-3 3-5 7-5s7 2 7 5" stroke={active ? "black" : "#6B7280"} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Subscriptions",
    href: "/admin/subscriptions",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="4" width="14" height="10" rx="2" stroke={active ? "black" : "#6B7280"} strokeWidth="1.5" />
        <path d="M2 8h14" stroke={active ? "black" : "#6B7280"} strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Revenue",
    href: "/admin/revenue",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 13L6 9l3 3 5-6" stroke={active ? "black" : "#6B7280"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Invoices",
    href: "/admin/invoices",
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="2" width="12" height="14" rx="1.5" stroke={active ? "black" : "#6B7280"} strokeWidth="1.5" />
        <path d="M6 6h6M6 9h6M6 12h3" stroke={active ? "black" : "#6B7280"} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

function NavItems({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 px-2 py-2 space-y-0.5">
      {NAV.map((item) => {
        const active = item.href === "/admin/dashboard"
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active
                ? "bg-[#f9f3f4] text-gray-900"
                : "text-gray-500 hover:bg-[#f9f3f4] hover:text-gray-800"
            }`}
          >
            {item.icon(active)}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await axios.post("/api/admin/auth/logout").catch(() => {});
    router.push("/admin/login");
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex shrink-0 w-56 bg-[#f8f8f8] flex-col">
        <div className="py-5 px-5 shrink-0">
          <img
            src="/assets/images/logo/logo-transparent-slim.png"
            alt="Kloot"
            className="h-6 w-auto object-contain"
          />
        </div>
        <NavItems pathname={pathname} />
        <div className="pb-5 border-t border-gray-100 pt-4 px-2">
          <p className="text-xs text-gray-400 px-3 mb-1 truncate">{adminName}</p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 3H4a1 1 0 00-1 1v10a1 1 0 001 1h3M12 13l4-4-4-4M16 9H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#f8f8f8] border-b border-gray-100 flex items-center px-4 gap-3">
        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <img
          src="/assets/images/logo/logo-transparent-slim.png"
          alt="Kloot"
          className="h-5 w-auto object-contain"
        />
      </div>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative z-10 w-64 bg-[#f8f8f8] flex flex-col h-full shadow-xl">
            <div className="flex items-center justify-between py-4 px-5 shrink-0">
              <img
                src="/assets/images/logo/logo-transparent-slim.png"
                alt="Kloot"
                className="h-6 w-auto object-contain"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="Close menu"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 3l12 12M15 3L3 15" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <NavItems pathname={pathname} onNavigate={() => setIsOpen(false)} />
            <div className="pb-6 border-t border-gray-100 pt-4 px-2">
              <p className="text-xs text-gray-400 px-3 mb-1 truncate">{adminName}</p>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M7 3H4a1 1 0 00-1 1v10a1 1 0 001 1h3M12 13l4-4-4-4M16 9H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
