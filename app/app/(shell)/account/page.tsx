"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { AccountTab } from "@/components/dashboard/AccountTab";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { IgStats } from "@/components/dashboard/types";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { Toast } from "@/components/ui/Toast";

function AccountPageInner() {
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
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const showToast = useCallback((message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (searchParams.get("ig_connected") === "1") {
      showToast("Instagram connected successfully");
      const url = new URL(window.location.href);
      url.searchParams.delete("ig_connected");
      router.replace(url.pathname + (url.search || ""));
    }
  }, [searchParams, showToast, router]);

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
      setProfilePic(res.data?.profile_image_url ?? ig.profile_pic ?? null);
      if (ig.username) setHandle(ig.username);
      if (res.data?.username) setAppUsername(res.data.username);
      if (res.data?.email) setEmail(res.data.email);
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await axios.post("/api/auth/logout").catch(() => {});
    window.location.href = "/app/login";
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <DashboardTopBar
        appUsername={appUsername}
        profilePic={profilePic}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
      />
      <div className="flex-1 overflow-hidden">
        <AccountTab
          email={email}
          appUsername={appUsername}
          handle={handle}
          igStats={igStats}
          onLogout={handleLogout}
          onConnectInstagram={async () => {
            const res = await axios.get("/api/auth/instagram/connect?returnTo=/app/account");
            window.location.href = res.data.url;
          }}
          onDisconnectInstagram={async () => {
            await axios.delete("/api/auth/instagram/disconnect");
            setHandle("");
            setIgStats({ followers: null, avgViews: null, engagement: null, avgReach: null, growth: null });
            showToast("Instagram disconnected", "info");
          }}
          onDeleteAccount={async () => {
            await axios.delete("/api/auth/delete-account");
            showToast("Account deleted");
            setTimeout(() => { window.location.href = "/"; }, 1500);
          }}
          onPasswordChanged={() => showToast("Password updated")}
        />
      </div>
    </>
  );
}

export default function AccountPage() {
  return (
    <Suspense>
      <AccountPageInner />
    </Suspense>
  );
}
