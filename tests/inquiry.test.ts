import { test } from "node:test";
import assert from "node:assert/strict";
import { submitInquiry, validateInquiry } from "../lib/inquiry.ts";
const valid = {
  name: "Preview test",
  email: "preview@example.com",
  subject: "Preview inquiry",
  message: "A production inquiry.",
};
test("requires all four contact fields and rejects invalid email", () => {
  for (const key of ["name", "email", "subject", "message"])
    assert.ok(validateInquiry({ ...valid, [key]: "" }).error);
  assert.ok(validateInquiry({ ...valid, email: "someone@" }).error);
  assert.ok(validateInquiry(null).error);
});
test("bounds payloads and normalizes whitespace without deleting message content", () => {
  assert.ok(validateInquiry({ ...valid, message: "x".repeat(5001) }).error);
  assert.ok(validateInquiry({ ...valid, subject: "x".repeat(201) }).error);
  assert.equal(
    validateInquiry({ ...valid, name: " Preview test " }).data?.name,
    "Preview test",
  );
  assert.equal(
    validateInquiry({ ...valid, message: "First line\nSecond line" }).data
      ?.message,
    "First line\nSecond line",
  );
});

test("sends the four inquiry fields and lets the form key determine the receiving inbox", async () => {
  const payloads: Record<string, unknown>[] = [];
  const send: typeof fetch = async (url, options) => {
    assert.equal(url, "https://api.web3forms.com/submit");
    assert.equal(options?.method, "POST");
    assert.ok(options?.signal);
    payloads.push(JSON.parse(String(options?.body)));
    return Response.json({ success: true });
  };
  await submitInquiry({ ...valid, website: "" }, "test-form-a", send);
  await submitInquiry(valid, "test-form-b", send);
  assert.deepEqual(payloads[0], {
    access_key: "test-form-a",
    from_name: "IMMRSV Website",
    subject: `IMMRSV inquiry: ${valid.subject}`,
    name: valid.name,
    email: valid.email,
    message: valid.message,
    botcheck: false,
  });
  assert.deepEqual(payloads[1], { ...payloads[0], access_key: "test-form-b" });
});

test("invalid data, a filled honeypot, and missing configuration never make a network request", async () => {
  let calls = 0;
  const send: typeof fetch = async () => {
    calls += 1;
    return Response.json({ success: true });
  };
  await assert.rejects(
    submitInquiry({ ...valid, email: "invalid" }, "test-form", send),
  );
  await assert.rejects(
    submitInquiry({ ...valid, website: "spam" }, "test-form", send),
  );
  await assert.rejects(submitInquiry(valid, " ", send));
  assert.equal(calls, 0);
});

test("only an HTTP success with an explicit provider confirmation counts as sent", async () => {
  for (const [status, body] of [
    [200, { success: false }],
    [200, { success: "true" }],
    [200, {}],
    [200, null],
    [400, { success: true }],
    [500, { success: false }],
  ] as const) {
    await assert.rejects(
      submitInquiry(valid, "test-form", async () =>
        Response.json(body, { status }),
      ),
      /wasn’t sent/,
    );
  }
  await assert.rejects(
    submitInquiry(valid, "test-form", async () =>
      Response.json({}, { status: 429 }),
    ),
    /temporarily unavailable/,
  );
});

test("network failures and malformed responses do not claim delivery or retry automatically", async () => {
  let calls = 0;
  await assert.rejects(
    submitInquiry(valid, "test-form", async () => {
      calls += 1;
      throw new TypeError("Failed to fetch");
    }),
    /couldn’t confirm/,
  );
  assert.equal(calls, 1);
  await assert.rejects(
    submitInquiry(valid, "test-form", async () => new Response("not JSON")),
    /couldn’t confirm/,
  );
});
