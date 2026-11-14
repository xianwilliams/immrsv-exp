import { chromium } from "playwright-core";
import fs from "node:fs/promises";
await fs.mkdir("qa/case-references", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
try {
  for (const [name, url] of [
    [
      "pendulum",
      "https://www.pendulum-creative.com/case-study/nike-x-virgil-abloh-archive-merch-booth",
    ],
    [
      "cnc",
      "https://cncexperiences.com/case-studies-work/uber-one-arcade-campus-tour/",
    ],
  ]) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3000);
    await fs.writeFile(
      `qa/case-references/${name}.txt`,
      await page.locator("body").innerText(),
    );
    for (const [i, y] of [0, 850, 1700, 2600].entries()) {
      await page.evaluate((y) => window.scrollTo(0, y), y);
      await page.waitForTimeout(900);
      await page.screenshot({ path: `qa/case-references/${name}-${i}.png` });
    }
    console.log(name, await page.title());
    await page.close();
  }
} finally {
  await browser.close();
}
