export function buildPackageMailto(
  email: string,
  name: string,
  packageTitle: string,
  packagePrice: string,
): string {
  const firstName = name.trim().split(/\s+/)[0] || name;
  const subject = encodeURIComponent(`Inquiry: ${packageTitle} – ${name}`);
  const body = encodeURIComponent(
    `Hi ${firstName},\n\n` +
    `I'm interested in your "${packageTitle}" package (${packagePrice}) and would love to discuss a collaboration.\n\n` +
    `Could you share more details about:\n` +
    `• Deliverables and timeline\n` +
    `• Availability\n` +
    `• Any customisation options\n\n` +
    `Looking forward to hearing from you!\n\n` +
    `Best regards`,
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

export function buildMailto(email: string, name: string): string {
  const firstName = name.trim().split(/\s+/)[0] || name;
  const subject = encodeURIComponent(`Brand Collaboration Inquiry – ${name}`);
  const body = encodeURIComponent(
    `Hi ${firstName},\n\n` +
      `I came across your Kloot profile and would love to explore a brand collaboration.\n\n` +
      `I'd like to discuss:\n` +
      `• Campaign objectives and creative direction\n` +
      `• Deliverables and timeline\n` +
      `• Budget and compensation\n\n` +
      `Please let me know your availability to discuss further.\n\n` +
      `Looking forward to connecting!\n\n` +
      `Best regards`,
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}
