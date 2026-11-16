import { chromium } from "playwright-core";
import assert from "node:assert/strict";

const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  await page.addInitScript(() =>
    sessionStorage.setItem("immrsv-intro", "seen"),
  );
  await page.goto(process.env.PREVIEW_URL || "http://127.0.0.1:3000", {
    waitUntil: "networkidle",
  });

  for (const [index, overlappingSection] of [
    [4, ".services-heading h2"],
    [7, ".service-accordion"],
  ]) {
    await page.locator(".trust").evaluate((section) => {
      scrollTo({
        top: section.getBoundingClientRect().bottom + scrollY - 280,
        behavior: "instant",
      });
    });
    const mark = page.locator(".client-mark").nth(index);
    await mark.locator(".client-logo-button").hover();
    const preview = mark.locator(".client-event-preview");
    await preview.waitFor({ state: "visible" });

    const overlap = await preview.evaluate((element, selector) => {
      const previewRect = element.getBoundingClientRect();
      const otherRect = document
        .querySelector(selector)
        .getBoundingClientRect();
      const left = Math.max(previewRect.left, otherRect.left);
      const right = Math.min(previewRect.right, otherRect.right);
      const top = Math.max(previewRect.top, otherRect.top);
      const bottom = Math.min(previewRect.bottom, otherRect.bottom);
      return {
        exists: right > left && bottom > top,
        previewOnTop: element.contains(
          document.elementFromPoint((left + right) / 2, (top + bottom) / 2),
        ),
      };
    }, overlappingSection);
    assert.ok(overlap.exists, `Preview overlaps ${overlappingSection}`);
    assert.ok(
      overlap.previewOnTop,
      `Preview remains above ${overlappingSection}`,
    );
    await mark.locator(".client-logo-button").focus();
    await page.keyboard.press("Escape");
    await preview.waitFor({ state: "hidden" });
  }
  console.log("Logo previews stay above the services heading and accordion.");
} finally {
  await browser.close();
}
