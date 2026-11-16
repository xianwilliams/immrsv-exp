import { NextRequest, NextResponse } from "next/server";
import { validateInquiry } from "@/lib/inquiry";
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const incoming = new URL(origin);
      if (
        incoming.host !== request.headers.get("host") ||
        incoming.protocol !== request.nextUrl.protocol
      )
        throw new Error("Origin mismatch");
    } catch {
      return NextResponse.json(
        { error: "Please send your inquiry from this website." },
        { status: 403 },
      );
    }
  }
  if (Number(request.headers.get("content-length") || 0) > 12000)
    return NextResponse.json(
      { error: "This message is too long." },
      { status: 413 },
    );
  let input: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 12000)
      return NextResponse.json(
        { error: "This message is too long." },
        { status: 413 },
      );
    input = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "We could not read that message. Please try again." },
      { status: 400 },
    );
  }
  const { data, error } = validateInquiry(input);
  if (!data) return NextResponse.json({ error }, { status: 400 });
  if (data.website)
    return NextResponse.json(
      { error: "We could not send that message." },
      { status: 400 },
    );
  if (!process.env.RESEND_API_KEY || !process.env.INQUIRY_FROM)
    return NextResponse.json(
      {
        error:
          "Please send your message directly by email using the link below.",
        emailFallback: true,
      },
      { status: 503 },
    );
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.INQUIRY_FROM,
        to: [process.env.INQUIRY_TO || "xian.williams@gmail.com"],
        reply_to: data.email,
        subject: `IMMRSV inquiry: ${data.subject}`,
        text: `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error("Delivery failed");
    return NextResponse.json({ sent: true });
  } catch {
    return NextResponse.json(
      {
        error:
          "Your message could not be sent. Please try again or send it directly by email.",
        emailFallback: true,
      },
      { status: 502 },
    );
  }
}
