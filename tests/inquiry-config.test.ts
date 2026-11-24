import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PHASE_PRODUCTION_BUILD,
  PHASE_DEVELOPMENT_SERVER,
} from "next/constants.js";
import config from "../next.config.ts";

test("a production build cannot publish a contact form without its delivery key", () => {
  const original = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
  const load = (phase: string) =>
    typeof config === "function" ? config(phase) : config;
  try {
    for (const key of [undefined, "", "   "]) {
      if (key === undefined)
        delete process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
      else process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY = key;
      assert.throws(
        () => load(PHASE_PRODUCTION_BUILD),
        /NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY/,
      );
    }
    assert.doesNotThrow(() => load(PHASE_DEVELOPMENT_SERVER));
    process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY = "test-form";
    assert.doesNotThrow(() => load(PHASE_PRODUCTION_BUILD));
  } finally {
    if (original === undefined)
      delete process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
    else process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY = original;
  }
});
