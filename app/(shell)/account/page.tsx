"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AccountTab } from "@/components/dashboard/AccountTab";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { IgStats } from "@/components/dashboard/types";
import { useDashboard } from "@/components/dashboard/DashboardContext";

export default function AccountPage() {
  const { sidebarCollapsed, setSidebarCollapsed } = useDashboard();
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [appUsername, setAppUsername] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [igStats, setIgStats] = useState<IgStats>({
    followers: null,
    avgViews: null,
    engagement: null,
    avgReach: null,
    growth: null,
  });

  useEffect(() => {
    axios.get("/api/analytics").then((res) => {
      const ig: Record<string, any> = res.data?.data?.data ?? {};
      setIgStats({
        followers: ig.followers_count ?? null,
        avgViews: ig.impressions_30d || null,
        engagement: null,
        avgReach: ig.reach_30d || null,
        growth: ig.follower_gain_30d || null,
      });
      if (ig.profile_pic) setProfilePic(ig.profile_pic);
      if (ig.username) setHandle(ig.username);
      if (res.data?.username) setAppUsername(res.data.username);
      if (res.data?.email) setEmail(res.data.email);
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await axios.post("/api/auth/logout").catch(() => {});
    window.location.href = "/login";
  };

  return (
    <>
      <DashboardTopBar
        appUsername={appUsername}
        profilePic={profilePic}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 overflow-hidden">
        <AccountTab
          email={email}
          appUsername={appUsername}
          handle={handle}
          igStats={igStats}
          onLogout={handleLogout}
          onConnectInstagram={async () => {
            const res = await axios.get("/api/auth/instagram/connect?returnTo=/account");
            window.location.href = res.data.url;
          }}
          onDisconnectInstagram={async () => {
            await axios.delete("/api/auth/instagram/disconnect");
            setHandle("");
            setIgStats({ followers: null, avgViews: null, engagement: null, avgReach: null, growth: null });
          }}
        />
      </div>
    </>
  );
}
