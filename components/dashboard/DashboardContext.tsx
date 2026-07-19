"use client";

import { createContext, useContext } from "react";

interface DashboardContextValue {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  onLogout: () => void;
  openActivateModal: () => void;
}

export const DashboardContext = createContext<DashboardContextValue>({
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  onLogout: () => {},
  openActivateModal: () => {},
});

export function useDashboard() {
  return useContext(DashboardContext);
}
