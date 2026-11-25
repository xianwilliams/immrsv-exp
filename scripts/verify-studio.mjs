import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright-core";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:3000";
const projectId = process.env.EXPECTED_SANITY_PROJECT || "mp1drxt3";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

await fs.mkdir("qa", { recursive: true });
try {
  // Fresh contexts exercise the real anonymous login, without account cookies.
  // This check neither signs in nor writes anything to Sanity.
  for (const [width, height, colorScheme, path] of [
    [1440, 900, "dark", "/studio"],
    [390, 844, "dark", "/studio/structure"],
    [320, 740, "light", "/studio/structure/project"],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      colorScheme,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(`${baseURL}${path}`);
    assert.equal(response.status(), 200, `Studio route ${path}`);
    await page.getByText("Choose login provider").waitFor();
    assert.equal(await page.title(), "Client login | IMMRSV Studio");
    assert.match(
      await page.locator('meta[name="robots"]').getAttribute("content"),
      /noindex/,
    );
    assert.equal(await page.locator(".page-frame").count(), 0);
    for (const provider of ["Google", "GitHub", "E-mail / password"]) {
      const link = page.getByRole("link", { name: provider, exact: true });
      assert(await link.isVisible(), `${provider} login is visible`);
      const url = new URL(await link.getAttribute("href"));
      assert.equal(url.origin, "https://api.sanity.io");
      assert.equal(url.searchParams.get("projectId"), projectId);
      assert.equal(
        new URL(url.searchParams.get("origin")).origin,
        new URL(baseURL).origin,
      );
      const box = await link.boundingBox();
      assert(box.x >= 0 && box.x + box.width <= width, "Login fits screen");
    }
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      "Studio must not overflow horizontally",
    );
    assert.deepEqual(errors, [], "No browser exceptions");
    await page.screenshot({
      path: `qa/studio-login-${width}-${colorScheme}.png`,
    });
    await context.close();
  }

  // The route-group split must preserve the public page URLs and layout.
  const page = await browser.newPage({ reducedMotion: "reduce" });
  for (const path of ["/", "/work/cms-test"]) {
    const response = await page.goto(`${baseURL}${path}`);
    assert.equal(response.status(), 200, `Public route ${path}`);
    assert.equal(await page.locator(".page-frame").count(), 1);
    assert.equal(await page.locator('a[href*="/studio"]').count(), 0);
    assert.equal(await page.getByText("Choose login provider").count(), 0);
  }
  console.log(
    "Studio: desktop/mobile login, deep links, noindex, provider origin/project, and public page isolation passed.",
  );
} finally {
  await browser.close();
}
