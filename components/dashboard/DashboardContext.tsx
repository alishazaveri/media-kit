"use client";

import { createContext, useContext } from "react";

interface DashboardContextValue {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  onLogout: () => void;
}

export const DashboardContext = createContext<DashboardContextValue>({
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  onLogout: () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}
