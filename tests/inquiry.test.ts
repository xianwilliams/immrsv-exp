import { test } from "node:test";
import assert from "node:assert/strict";
import { validateInquiry } from "../lib/inquiry.ts";
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
