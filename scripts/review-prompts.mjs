import { chromium } from "playwright-core";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
for (const name of ["gold-standard", "vante-ribbon-hero"]) {
  const page = await browser.newPage();
  await page.addInitScript(() => {
    navigator.clipboard.writeText = async (text) => {
      window.copiedPrompt = text;
    };
  });
  await page.goto(`https://motionsites.ai/?prompt=${name}`, {
    waitUntil: "domcontentloaded",
  });
  await page
    .locator("div.fixed.inset-0.z-40")
    .getByRole("button", { name: /Copy prompt/i })
    .first()
    .click({ timeout: 8000 });
  await page.waitForTimeout(500);
  const captured = await page.evaluate(() => window.copiedPrompt || "");
  await fs.writeFile(
    `qa/${name}-prompt.txt`,
    captured || (await page.locator("body").innerText()),
  );
  console.log(
    name,
    captured
      ? captured.slice(0, 1800)
      : (await page.locator("body").innerText()).slice(0, 2200),
  );
  await page.close();
}
await browser.close();
