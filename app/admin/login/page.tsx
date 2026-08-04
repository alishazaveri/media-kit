import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import LoginForm from "@/components/admin/LoginForm";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin/dashboard");
  return <LoginForm />;
}
