import { chromium } from "playwright-core";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

await fs.mkdir("qa/hero-seams", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
try {
  const intro = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await intro.goto("http://127.0.0.1:3000", { waitUntil: "domcontentloaded" });
  await intro.waitForFunction(
    () => getComputedStyle(document.querySelector(".intro")).display === "grid",
  );
  let previous = 0;
  for (const time of [100, 450, 850, 1100, 1450, 1800, 2050, 2300, 2650]) {
    await intro.waitForTimeout(Math.max(1, time - previous));
    await intro.screenshot({ path: `qa/hero-seams/intro-${time}.png` });
    previous = time;
  }
  assert.equal(
    await intro
      .locator(".intro")
      .evaluate((el) => getComputedStyle(el).display),
    "none",
  );
  for (const [width, height, scale] of [
    [1440, 900, 1],
    [1512, 982, 2],
    [390, 844, 3],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: scale,
    });
    await page.addInitScript(() =>
      sessionStorage.setItem("immrsv-intro", "seen"),
    );
    await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    await page.waitForFunction(() =>
      [...document.querySelectorAll(".hero-photo img")].every(
        (img) => img.complete && img.naturalWidth > 0,
      ),
    );
    // Check every photo join, including the duplicate-group seam, throughout a loop.
    for (const progress of [0, 0.17, 0.49, 0.83, 0.999]) {
      const joins = await page
        .locator(".hero-photo-track")
        .evaluate((track, p) => {
          const animation = track.getAnimations()[0];
          animation.pause();
          animation.currentTime = p * 100000;
          const photos = [...track.querySelectorAll(".hero-photo")];
          return photos
            .slice(1)
            .map(
              (photo, i) =>
                photo.getBoundingClientRect().left -
                photos[i].getBoundingClientRect().right,
            );
        }, progress);
      assert.ok(
        joins.every((gap) => gap <= 0),
        `No photo gaps at ${width}px / loop ${progress}`,
      );
    }
    await page.locator(".hero-photo-track").evaluate((track) => {
      track.getAnimations()[0].currentTime = 1000;
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `qa/hero-seams/hero-${width}.png` });
    // A uniform frame isolates alpha seams from changes in the moving photos.
    const measurements = await page.locator(".hero-film").evaluate((el) => {
      el.querySelector(".hero-photo-track").style.visibility = "hidden";
      el.style.background = "#000";
      const box = el.getBoundingClientRect();
      return {
        x: Math.round(box.width * 0.12),
        y: Math.floor(
          box.top +
            (parseFloat(getComputedStyle(el).getPropertyValue("--mark-h")) *
              innerWidth) /
              100,
        ),
      };
    });
    const oldMask = process.argv.includes("--old-mask");
    if (oldMask)
      await page.addStyleTag({
        content: `.hero-film { mask-image: url('/media/wordmark-mask.png'),linear-gradient(#000 0 0); -webkit-mask-image: url('/media/wordmark-mask.png'),linear-gradient(#000 0 0); mask-size: ${width < 600 ? 92 : 84}% var(--mark-h),100% calc(100% - var(--mark-h) + 1px); -webkit-mask-size: ${width < 600 ? 92 : 84}% var(--mark-h),100% calc(100% - var(--mark-h) + 1px); }`,
      });
    const path = `qa/hero-seams/${oldMask ? "old-" : ""}alpha-${width}.png`;
    await page.screenshot({ path });
    const sample = JSON.parse(
      execFileSync(
        "python3",
        [
          "-c",
          "from PIL import Image; import json,sys; im=Image.open(sys.argv[1]).convert('RGB'); x=int(sys.argv[2]);y=int(sys.argv[3]);s=int(sys.argv[4]); print(json.dumps([im.getpixel((x*s,j)) for j in range((y-8)*s,(y+5)*s)]))",
          path,
          String(measurements.x),
          String(measurements.y),
          String(scale),
        ],
        { encoding: "utf8" },
      ),
    );
    assert.ok(
      sample.every((rgb) => rgb.every((value) => value <= 2)),
      `No pale horizontal seam at ${width}px / DPR ${scale}`,
    );
    await page.close();
  }
  console.log(
    "Logo transition captured; no alpha seam or photo gaps at desktop, Retina, or mobile dimensions.",
  );
} finally {
  await browser.close();
}
