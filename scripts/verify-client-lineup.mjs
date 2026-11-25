import { chromium } from "playwright-core";
import fs from "node:fs/promises";
import assert from "node:assert/strict";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:3100";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const css = (
  await Promise.all(
    ["app/globals.css", "components/home-revision.css"].map((file) =>
      fs.readFile(file, "utf8"),
    ),
  )
).join("\n");
await fs.mkdir("qa", { recursive: true });
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto(baseURL, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.locator("#clients").scrollIntoViewIfNeeded();
    for (const image of await page.locator(".client-logo-button img").all()) {
      await image.evaluate((el) => el.decode());
    }
    await page.locator("#clients").screenshot({
      path: `qa/client-lineup-live-${width}.png`,
    });
  }
  const template = await page
    .locator(".client-mark")
    .first()
    .evaluate((el) => {
      const copy = el.cloneNode(true);
      copy.removeAttribute("style");
      copy.classList.remove("is-previewing");
      return copy.outerHTML;
    });
  // Exercise the real logo markup and styles with additional editor-created items.
  // No test documents or uploaded assets are written to Sanity.
  for (const width of [1440, 768, 699, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 });
    for (const count of [7, 8, 9, 10, 5, 6, 1, 13, 60]) {
      await page.setContent(`<!doctype html><html><head><base href="${baseURL}"><style>${css}</style></head>
        <body class="home-revision"><section class="trust" id="clients"><div class="trust-proof">
        <h2>WHO WE’VE WORKED WITH.</h2><div class="client-marks">${template.repeat(count)}</div>
        </div></section><section id="after">NEXT SECTION</section></body></html>`);
      const layout = await page.locator(".client-marks").evaluate((el) => {
        const box = el.getBoundingClientRect();
        const rows = [];
        for (const child of el.children) {
          const rect = child.getBoundingClientRect();
          let row = rows.find((r) => Math.abs(r.top - rect.top) < 2);
          if (!row)
            rows.push(
              (row = {
                top: rect.top,
                left: rect.left,
                right: rect.right,
                count: 0,
              }),
            );
          row.right = rect.right;
          row.count++;
        }
        return {
          center: box.left + box.width / 2,
          rows,
          bottom: box.bottom,
          nextTop: document.querySelector("#after").getBoundingClientRect().top,
          scrollWidth: document.documentElement.scrollWidth,
        };
      });
      const columns = width <= 699 ? 2 : 3;
      assert.equal(layout.rows.length, Math.ceil(count / columns));
      for (const row of layout.rows) {
        assert(
          Math.abs((row.left + row.right) / 2 - layout.center) <= 2,
          `${count} logos at ${width}px: row of ${row.count} must be centered`,
        );
      }
      assert(
        layout.bottom <= layout.nextTop,
        "Extra rows must grow the section",
      );
      assert(
        layout.scrollWidth <= width,
        "Logo rows must not overflow horizontally",
      );
      if (count === 7 || (count === 8 && width === 1440)) {
        await page
          .locator("#clients")
          .screenshot({ path: `qa/client-lineup-${width}-${count}.png` });
      }
    }
  }
  console.log(
    "Client lineup: centered rows and vertical growth passed for 1–60 logos across five viewport widths.",
  );
} finally {
  await browser.close();
}
