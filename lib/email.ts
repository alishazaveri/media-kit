import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendTemplateEmailOptions {
  to: string;
  templateId: string;
  variables?: Record<string, string | number>;
}

export async function sendTemplateEmail({ to, templateId, variables }: SendTemplateEmailOptions) {
  const { data, error } = await resend.emails.send({
    to,
    template: { id: templateId, variables },
  });
  if (error) throw new Error(`Email send failed: ${error.message}`);
  return data;
}
