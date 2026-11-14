import { chromium } from "playwright-core";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  Element.prototype.requestPointerLock = () => Promise.resolve();
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
});
await page.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
for (const [i, delay] of [250, 500, 500, 500, 600].entries()) {
  await page.waitForTimeout(delay);
  await page.screenshot({ path: `qa/intro-${i}.png` });
}
for (const name of ["about", "closing"]) {
  await page.locator("." + name).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `qa/desktop-${name}.png` });
}
await page.emulateMedia({ reducedMotion: "reduce" });
await page.getByRole("button", { name: "Resume review carousel" }).click();
assert.equal(
  await page.getByRole("button", { name: "Pause review carousel" }).isVisible(),
  true,
);
console.log(
  "Intro and final sections captured; reduced-motion carousel can be explicitly resumed.",
);
await browser.close();
