"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { DashboardContext } from "@/components/dashboard/DashboardContext";
import { DashboardSidebar, NAV_ITEMS } from "@/components/dashboard/DashboardSidebar";
import { useUser } from "@/contexts/UserContext";

function TrialBanner() {
  const { trialEndsAt, subscription, hasScheduledSubscription } = useUser();
  if (!trialEndsAt || subscription || hasScheduledSubscription) return null;

  const endsAt = new Date(trialEndsAt);
  if (endsAt <= new Date()) return null;

  const daysLeft = Math.ceil((endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const formatted = endsAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 shrink-0 text-center">
      <p className="text-xs text-amber-800 font-medium">
        Free trial — {daysLeft} day{daysLeft !== 1 ? "s" : ""} left · expires {formatted} ·{" "}
        <span className="block sm:inline">
          <Link href="/app/plan" className="font-semibold text-amber-900 underline underline-offset-2">
            Activate now
          </Link>
          {" "}· payment starts only after trial ends
        </span>
      </p>
    </div>
  );
}

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (window.innerWidth <= 1100) setSidebarCollapsed(true);
  }, []);
  const pathname = usePathname();

  const handleLogout = async () => {
    await axios.post("/api/auth/logout").catch(() => {});
    window.location.href = "/app/login";
  };

  return (
    <DashboardContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed, onLogout: handleLogout }}>
      <div className="h-[100dvh] flex overflow-hidden bg-[#FAF7F2]">
        <DashboardSidebar collapsed={sidebarCollapsed} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TrialBanner />
          {children}
        </div>

        {/* Mobile bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-100 flex z-40">
          {NAV_ITEMS.map(({ id, label, Icon, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={id}
                href={href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${
                  active ? "text-primary" : "text-gray-400"
                }`}
              >
                <Icon active={active} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </DashboardContext.Provider>
  );
}
