import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex h-screen bg-[#FAF7F2] overflow-hidden">
      <AdminSidebar adminName={session.name} />
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
