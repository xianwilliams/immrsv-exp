export type Inquiry = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
};
export function validateInquiry(input: unknown): {
  data?: Inquiry;
  error?: string;
} {
  if (!input || typeof input !== "object")
    return { error: "Please complete the required fields." };
  const raw = input as Record<string, unknown>;
  const data = Object.fromEntries(
    ["name", "email", "subject", "message", "website"].map((k) => [
      k,
      typeof raw[k] === "string" ? raw[k].trim() : "",
    ]),
  ) as Inquiry;
  if (!data.name || !data.subject || !data.message)
    return { error: "Please complete all four fields." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return { error: "Please enter a valid email address." };
  if (
    data.name.length > 120 ||
    data.subject.length > 200 ||
    data.email.length > 254 ||
    data.message.length > 5000
  )
    return {
      error:
        "Please keep your message under 5,000 characters and your subject under 200.",
    };
  return { data };
}
