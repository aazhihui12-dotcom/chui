import type { Locale } from "@/content/schema";

export type InquiryPayload = { name: string; email: string; company?: string; phone?: string; message: string; product?: string; locale: Locale };
export function validateInquiry(payload: Partial<InquiryPayload>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!payload.name?.trim()) errors.name = "Name is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email?.trim() ?? "")) errors.email = "Enter a valid email";
  if (!payload.message?.trim()) errors.message = "Message is required";
  if (payload.locale !== "en" && payload.locale !== "cn") errors.locale = "Choose a supported language";
  return errors;
}

/**
 * Transport boundary: future POST /api/inquiry with a JSON InquiryPayload body,
 * returning { ok: true, reference: string }; reject on HTTP/application failure.
 * Replace only this adapter with fetch when a backend exists. This static export
 * intentionally has no Next API route, persistence, network request, or email.
 */
export async function submitInquiry(payload: InquiryPayload): Promise<{ ok: true; reference: string }> {
  if (Object.keys(validateInquiry(payload)).length) throw new Error("Invalid inquiry");
  await new Promise<void>((resolve) => setTimeout(resolve, 300));
  return { ok: true, reference: `SIM-${crypto.randomUUID()}` };
}
