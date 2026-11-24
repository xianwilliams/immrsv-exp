import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants.js";

export default function config(phase: string): NextConfig {
  if (
    phase === PHASE_PRODUCTION_BUILD &&
    !process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim()
  ) {
    throw new Error(
      "Set NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY in the hosting environment before building. The contact form requires direct email delivery.",
    );
  }
  return { poweredByHeader: false, devIndicators: false };
}
