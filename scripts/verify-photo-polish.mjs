import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

await fs.mkdir("qa/photo-polish", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() =>
    sessionStorage.setItem("immrsv-intro", "seen"),
  );
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.locator(".work").scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => document.querySelector(".work-canvas").width > 300,
  );
  await page.locator(".work-view-button").click();
  const projects = [
    ...Array.from({ length: 6 }, (_, i) => [".work-card", i]),
    ...[3, 4, 6].map((i) => [".project-row", i]),
  ];
  const inspected = [];
  for (const [selector, index] of projects) {
    await page.locator(selector).nth(index).click();
    const dialog = page.locator(".project-dialog");
    const route = await dialog
      .getByRole("link", { name: "EXPLORE THE FULL PROJECT" })
      .getAttribute("href");
    const slug = route.split("/").at(-1);
    await dialog
      .getByRole("button", { name: "Pause project slideshow" })
      .click();
    await page.mouse.move(0, 0);
    const panels = dialog.locator(".ag-panel");
    for (let i = 0; i < (await panels.count()); i++) {
      await panels.nth(i).focus();
      await page.waitForTimeout(200);
      const fillsDuringMotion = await panels.evaluateAll((items) =>
        items.every((panel) => {
          const frame = panel
            .querySelector(".ag-panel__frame")
            .getBoundingClientRect();
          const media = panel
            .querySelector(".ag-panel__media")
            .getBoundingClientRect();
          return (
            media.width >= frame.width - 1 && media.height >= frame.height - 1
          );
        }),
      );
      assert.ok(
        fillsDuringMotion,
        `${slug} ${i}: photos must fill panels while moving`,
      );
      await page.waitForTimeout(700);
      assert.equal(await panels.nth(i).getAttribute("aria-current"), "true");
      const photo = panels.nth(i).locator("img");
      await photo.evaluate((img) => img.decode());
      assert.equal(
        await photo.evaluate((img) => getComputedStyle(img).objectFit),
        "cover",
      );
      const rect = await panels.nth(i).boundingBox();
      const media = await panels
        .nth(i)
        .locator(".ag-panel__media")
        .boundingBox();
      assert.ok(
        media.width >= rect.width - 1 && media.height >= rect.height - 1,
        `${slug} ${i}: image must fill its panel`,
      );
      await dialog
        .locator(".accordion-gallery")
        .screenshot({ path: `qa/photo-polish/${slug}-${i}.png` });
    }
    inspected.push({ slug, photos: await panels.count() });
    await panels.first().click();
    await page.locator(".photo-viewer").waitFor();
    assert.equal(
      await page
        .locator(".photo-viewer img")
        .evaluate((img) => getComputedStyle(img).objectFit),
      "contain",
    );
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
  }

  for (const width of [360, 390, 599, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    const nav = await page.locator(".hero-nav").boundingBox();
    const film = await page.locator(".hero-film").boundingBox();
    const gap = film.y - nav.y - nav.height;
    assert.ok(gap >= 12 && gap <= 50, `mobile hero gap at ${width}: ${gap}`);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({ path: `qa/photo-polish/hero-${width}.png` });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:3000/work/wcdonalds", {
    waitUntil: "networkidle",
  });
  const banner = page.locator(".case-contact");
  await banner.scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.querySelectorAll(".case-contact-photos img")].every(
      (img) => img.complete && img.naturalWidth > 0,
    ),
  );
  const ids = await banner
    .locator("img")
    .evaluateAll((imgs) => imgs.map((img) => img.dataset.project));
  assert.equal(
    new Set(ids).size,
    ids.length,
    "Each banner slide features a different project",
  );
  const heading = await banner.locator("h2").textContent();
  assert.equal(heading, "YOUR NEXT IDEA.OUT IN THE WORLD.");
  assert.equal(
    await banner
      .locator("h2 em")
      .evaluate((el) => getComputedStyle(el).fontWeight),
    "350",
  );
  const first = await banner
    .locator("img.is-active")
    .getAttribute("data-project");
  await page.waitForTimeout(5800);
  assert.notEqual(
    await banner.locator("img.is-active").getAttribute("data-project"),
    first,
  );
  await banner.getByRole("button", { name: "Pause banner slideshow" }).click();
  await page.waitForTimeout(1500);
  const current = await banner
    .locator("img.is-active")
    .getAttribute("data-project");
  await page.waitForTimeout(5700);
  assert.equal(
    await banner.locator("img.is-active").getAttribute("data-project"),
    current,
  );
  await banner.screenshot({ path: "qa/photo-polish/banner-desktop.png" });
  await banner.getByRole("button", { name: "WORK WITH US" }).click();
  await page.locator(".contact-dialog").waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await banner.scrollIntoViewIfNeeded();
  assert.equal(
    await banner.evaluate((el) => getComputedStyle(el).color),
    "rgb(255, 255, 255)",
  );
  await banner.screenshot({ path: "qa/photo-polish/banner-dark.png" });

  for (const width of [390, 600]) {
    await page.setViewportSize({ width, height: 844 });
    await banner.scrollIntoViewIfNeeded();
    await banner.evaluate((el) =>
      scrollTo({
        top:
          el.getBoundingClientRect().top +
          scrollY -
          document.querySelector(".case-header").clientHeight -
          12,
        behavior: "instant",
      }),
    );
    await banner.screenshot({ path: `qa/photo-polish/banner-${width}.png` });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });
  await banner.scrollIntoViewIfNeeded();
  await banner.getByRole("button", { name: "Play banner slideshow" }).waitFor();
  const reducedBefore = await banner
    .locator("img.is-active")
    .getAttribute("data-project");
  await page.waitForTimeout(5800);
  assert.equal(
    await banner.locator("img.is-active").getAttribute("data-project"),
    reducedBefore,
  );
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({ inspected, bannerSlides: ids, errors }, null, 2),
  );
} finally {
  await browser.close();
}
