"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PlanTab } from "@/components/dashboard/PlanTab";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { useDashboard } from "@/components/dashboard/DashboardContext";

export default function PlanPage() {
  const { sidebarCollapsed, setSidebarCollapsed } = useDashboard();
  const [appUsername, setAppUsername] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    axios.get("/api/analytics").then((res) => {
      if (res.data?.username) setAppUsername(res.data.username);
      const ig: Record<string, any> = res.data?.data?.data ?? {};
      setProfilePic(res.data?.profile_image_url ?? ig.profile_pic ?? null);
    }).catch(() => {});
  }, []);

  return (
    <>
      <DashboardTopBar
        appUsername={appUsername}
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
