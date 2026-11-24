import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const errors = [];
await fs.mkdir("qa", { recursive: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    page.on("pageerror", (error) => errors.push(error.message));
    let submitted;
    let release;
    let requests = 0;
    let outcome = false;
    async function respond() {
      const deadline = Date.now() + 5000;
      while (!release && Date.now() < deadline)
        await new Promise((resolve) => setTimeout(resolve, 20));
      assert(release, "The browser did not submit a request.");
      release();
    }
    // This test must never send real mail, including when a live key is set.
    await page.route("https://api.web3forms.com/submit", async (route) => {
      requests++;
      submitted = route.request().postDataJSON();
      await new Promise((resolve) => {
        release = resolve;
      });
      await route.fulfill({ json: { success: outcome } });
    });
    await page.goto(
      `${process.env.BASE_URL || "http://127.0.0.1:3100"}/#contact`,
    );
    const form = page.locator("#contact form");
    const fields = {
      name: "Browser verification",
      email: "preview@example.com",
      subject: "Mocked submission only",
      message: "A first line.\nA second line. No actual email is sent.",
    };
    for (const [name, value] of Object.entries(fields)) {
      await form.locator(`[name="${name}"]`).fill(value);
    }
    const submit = form.getByRole("button", {
      name: "SEND MESSAGE",
      exact: true,
    });
    assert.equal(
      await submit.count(),
      1,
      "The form must always offer direct submission, never an email draft.",
    );
    assert.equal(await form.locator('a[href^="mailto:"]').count(), 0);
    const initialUrl = page.url();
    await submit.click();
    if (process.env.EXPECT_MISSING_FORM_KEY === "1") {
      await form.getByRole("alert").waitFor();
      assert.match(
        await form.getByRole("alert").innerText(),
        /hasn’t been sent/,
      );
      assert.equal(requests, 0);
      assert.equal(
        await page.locator(".email-draft, .form-success").count(),
        0,
      );
      assert.equal(await form.locator('a[href^="mailto:"]').count(), 0);
      for (const [name, value] of Object.entries(fields)) {
        assert.equal(
          await form.locator(`[name="${name}"]`).inputValue(),
          value,
        );
      }
      assert.equal(page.url(), initialUrl);
      await page.close();
      console.log(
        `Missing-key check passed at ${width}px: stays on-page, retains input, never opens a mail app.`,
      );
      continue;
    }
    await page.getByRole("button", { name: "SENDING…" }).waitFor();
    assert(await page.getByRole("button", { name: "SENDING…" }).isDisabled());
    // Repeated form submission while the request is pending must be ignored.
    await form.evaluate((element) => element.requestSubmit());
    await respond();
    await form.getByRole("alert").waitFor();
    assert.equal(requests, 1);
    for (const [name, value] of Object.entries(fields)) {
      assert.equal(await form.locator(`[name="${name}"]`).inputValue(), value);
    }
    assert.match(await form.getByRole("alert").innerText(), /wasn’t sent/);
    assert.equal(await page.locator(".form-success").count(), 0);
    assert.equal(submitted.email, fields.email);
    assert.equal(submitted.message, fields.message);
    assert.equal(submitted.subject, `IMMRSV inquiry: ${fields.subject}`);
    assert(!("to" in submitted) && !("ccemail" in submitted));
    await page
      .locator("#contact")
      .screenshot({ path: `qa/contact-error-${width}.png` });
    outcome = true;
    release = undefined;
    await submit.click();
    await respond();
    await page
      .getByRole("heading", { name: "Thanks for reaching out." })
      .waitFor();
    assert.equal(requests, 2);
    assert.equal(page.url(), initialUrl);
    assert.equal(await page.locator(".email-draft").count(), 0);
    assert.equal(await page.locator("#contact form").count(), 0);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page
      .locator("#contact")
      .screenshot({ path: `qa/contact-success-${width}.png` });
    await page.close();
    console.log(
      `Contact checks passed at ${width}px (all mail requests mocked).`,
    );
  }
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
