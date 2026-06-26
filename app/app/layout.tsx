import { UserProvider } from "@/contexts/UserContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
