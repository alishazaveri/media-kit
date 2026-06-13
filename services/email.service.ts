import { sendTemplateEmail } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kloot.io";

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const reset_url = `${APP_URL}/app/reset-password?token=${resetToken}`;
  return sendTemplateEmail({
    to,
    templateId: "password-reset",
    variables: { reset_url },
  });
}
