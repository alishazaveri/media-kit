import { redirect } from "next/navigation";

export default function UsernamePage({
  searchParams,
}: {
  searchParams: { username?: string };
}) {
  const username = searchParams.username;
  if (username) {
    redirect(`/onboarding?username=${encodeURIComponent(username)}`);
  }
  redirect("/onboarding");
}
