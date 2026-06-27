"use client";

import axios from "axios";
import { PlanTab } from "@/components/dashboard/PlanTab";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { useUser } from "@/contexts/UserContext";

export default function PlanPage() {
  const { sidebarCollapsed, setSidebarCollapsed } = useDashboard();
  const { username, profilePic } = useUser();

  return (
    <>
      <DashboardTopBar
        appUsername={username}
        profilePic={profilePic}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={async () => { await axios.post("/api/auth/logout").catch(() => {}); window.location.href = "/app/login"; }}
      />
      <div className="flex-1 overflow-hidden">
        <PlanTab />
      </div>
    </>
  );
}
