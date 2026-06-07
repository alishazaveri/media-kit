"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function CustomizeIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 2a2 2 0 100 4 2 2 0 000-4zM4 9a2 2 0 100 4 2 2 0 000-4zM14 9a2 2 0 100 4 2 2 0 000-4z"
        stroke={active ? "black" : "#6B7280"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9 4v3M4 11v3M14 11v3"
        stroke={active ? "black" : "#6B7280"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AccountIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle
        cx="9"
        cy="6"
        r="3"
        stroke={active ? "black" : "#6B7280"}
        strokeWidth="1.5"
      />
      <path
        d="M2 16C2 13 5 11 9 11C13 11 16 13 16 16"
        stroke={active ? "black" : "#6B7280"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BillingIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect
        x="2"
        y="4"
        width="14"
        height="10"
        rx="2"
        stroke={active ? "black" : "#6B7280"}
        strokeWidth="1.5"
      />
      <path
        d="M2 8H16"
        stroke={active ? "black" : "#6B7280"}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export const NAV_ITEMS = [
  { id: "customize", label: "Customize", Icon: CustomizeIcon, href: "/app/dashboard" },
  { id: "account", label: "Account", Icon: AccountIcon, href: "/app/account" },
  // Uncomment later
  // { id: "plan", label: "Plan & billing", Icon: BillingIcon, href: "/app/plan" },
];

interface Props {
  onLogout: () => void;
  collapsed: boolean;
}

export function DashboardSidebar({ onLogout, collapsed }: Props) {
  const pathname = usePathname();

  return (
    <aside
      className={`hidden lg:flex shrink-0 bg-[#f8f8f8] flex-col transition-all duration-200 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div className={`py-5 flex items-center shrink-0 ${collapsed ? "justify-center px-0" : "px-5"}`}>
        {!collapsed && (
          <img
            src="/assets/images/logo/logo-transparent-slim.png"
            alt="Kloot"
            className="h-6 w-auto object-contain"
          />
        )}
      </div>

      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {NAV_ITEMS.map(({ label, Icon, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center py-2.5 rounded-xl text-sm font-medium transition-colors ${
                collapsed ? "justify-center px-0" : "gap-3 px-3"
              } ${
                active
                  ? "bg-[#f9f3f4]"
                  : "text-gray-500 hover:bg-[#f9f3f4] hover:text-gray-800"
              }`}
            >
              <Icon active={active} />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      <div className={`pb-5 border-t border-gray-100 pt-4 px-2`}>
        <button
          onClick={onLogout}
          title={collapsed ? "Log out" : undefined}
          className={`w-full flex items-center py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors ${
            collapsed ? "justify-center px-0" : "gap-3 px-3"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M7 3H4a1 1 0 00-1 1v10a1 1 0 001 1h3M12 13l4-4-4-4M16 9H7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {!collapsed && "Log out"}
        </button>
      </div>
    </aside>
  );
}
