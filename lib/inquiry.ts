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

/** Send from the browser: Web3Forms requires this for its free spam checks. */
export async function submitInquiry(
  input: unknown,
  accessKey: string,
  send: typeof fetch = fetch,
): Promise<void> {
  const { data, error } = validateInquiry(input);
  if (!data) throw new Error(error);
  if (data.website)
    throw new Error(
      "We couldn’t send your message. Please refresh the page and try again.",
    );
  if (!accessKey.trim())
    throw new Error(
      "The form is temporarily unavailable. Your message hasn’t been sent. Please try again later.",
    );

  let response: Response;
  let result: unknown;
  try {
    response = await send("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey.trim(),
        from_name: "IMMRSV Website",
        subject: `IMMRSV inquiry: ${data.subject}`,
        name: data.name,
        email: data.email,
        message: data.message,
        botcheck: false,
      }),
      signal: AbortSignal.timeout(15000),
    });
    result = await response.json();
  } catch {
    throw new Error(
      "We couldn’t confirm your submission. Your message is still here; please try again.",
    );
  }
  if (response.status === 429)
    throw new Error(
      "The form is temporarily unavailable. Please try again later.",
    );
  if (
    !response.ok ||
    !result ||
    typeof result !== "object" ||
    !("success" in result) ||
    result.success !== true
  )
    throw new Error("Your message wasn’t sent. Please try again.");
}
