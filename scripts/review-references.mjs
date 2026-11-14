import { chromium } from "playwright-core";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const references = [
  ["episode1", "https://www.episode1agency.com/"],
  ["gold-standard", "https://motionsites.ai/?prompt=gold-standard"],
  ["vante", "https://motionsites.ai/?prompt=vante-ribbon-hero"],
  ["sunset", "https://www.sunset-studios.co/"],
  ["hovercraft", "https://www.hovercraftstudio.com/work"],
  ["pendulum", "https://www.pendulum-creative.com/"],
  ["dime", "https://www.dimeshock.com/"],
  ["cnc", "https://cncexperiences.com/"],
];
const report = [];
for (let start = 0; start < references.length; start += 3) {
  await Promise.all(
    references.slice(start, start + 3).map(async ([name, url]) => {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 900 },
      });
      await page.addInitScript(() => {
        Element.prototype.requestPointerLock = () => Promise.resolve();
        Element.prototype.setPointerCapture = () => {};
        Element.prototype.releasePointerCapture = () => {};
      });
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
        await page.waitForTimeout(3500);
        await page.screenshot({ path: `qa/reference-${name}.png` });
        report.push({ name, url, title: await page.title() });
      } catch (error) {
        report.push({ name, url, error: error.message.slice(0, 150) });
      }
      await page.close();
    }),
  );
}
await fs.writeFile("qa/reference-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
await browser.close();
