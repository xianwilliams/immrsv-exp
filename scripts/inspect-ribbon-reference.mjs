import { chromium } from "playwright-core";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.addInitScript(() => {
    Element.prototype.requestPointerLock = () => Promise.resolve();
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
    navigator.clipboard.writeText = async (text) => {
      window.copiedPrompt = text;
    };
    document.execCommand = (command) => {
      if (command === "copy") {
        window.copiedPrompt =
          document.activeElement?.value || window.getSelection()?.toString();
        return true;
      }
      return false;
    };
  });
  await page.goto("https://motionsites.ai/?prompt=vante-ribbon-hero", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(1500);
  const panel = page.locator("div.fixed.inset-0.z-40");
  console.log(
    "BUTTONS",
    await panel.locator("button").evaluateAll((elements) =>
      elements.map((el) => ({
        text: el.innerText,
        label: el.getAttribute("aria-label"),
      })),
    ),
  );
  await panel
    .getByRole("button", { name: "Copy full prompt", exact: true })
    .click();
  await page.waitForTimeout(3500);
  const text = await page.evaluate(() => window.copiedPrompt || "");
  await fs.writeFile(
    "qa/ribbon-reference-prompt.txt",
    text || (await panel.innerText()),
  );
  console.log("COPIED", text.slice(0, 2400));
  console.log("AFTER", await panel.innerText());
  await page.screenshot({ path: "qa/ribbon-reference-panel.png" });
} finally {
  await browser.close();
}
