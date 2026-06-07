"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { DashboardContext } from "@/components/dashboard/DashboardContext";
import { DashboardSidebar, NAV_ITEMS } from "@/components/dashboard/DashboardSidebar";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
