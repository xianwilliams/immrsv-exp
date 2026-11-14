import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
await fs.mkdir("qa/theme", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const errors = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text() + " " + m.location().url);
  });
  await page.addInitScript(() =>
    sessionStorage.setItem("immrsv-intro", "seen"),
  );
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await page.screenshot({ path: "qa/theme/dark-hero.png" });
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(
    await page
      .getByRole("button", { name: "Switch to light mode" })
      .getAttribute("aria-pressed"),
    "true",
  );
  assert.equal(
    await page
      .locator(".hero-photo img")
      .first()
      .evaluate((el) => getComputedStyle(el).filter),
    "none",
  );
  await page.locator(".services").scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(1000);
  const initialService = await page
    .locator(".service-selection h3")
    .textContent();
  await page.waitForTimeout(6200);
  assert.notEqual(
    await page.locator(".service-selection h3").textContent(),
    initialService,
    "Services autoplay advances",
  );
  await page.getByRole("button", { name: "Pause services slideshow" }).click();
  const pausedService = await page
    .locator(".service-selection h3")
    .textContent();
  await page.waitForTimeout(1000);
  assert.equal(
    await page.locator(".service-selection h3").textContent(),
    pausedService,
  );
  await page.locator(".service-accordion .ag-panel").first().click();
  for (const selector of [".services", ".trust", ".closing", ".friends"]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `qa/theme/dark-${selector.slice(1)}.png` });
  }
  assert.equal(
    (await page.locator(".services h3").textContent()).trim(),
    "Project management |",
  );
  const split = await page.evaluate(() => {
    const title = document
      .querySelector(".services-heading")
      .getBoundingClientRect();
    const panel = document
      .querySelector(".service-accordion")
      .getBoundingClientRect();
    return title.right <= panel.left;
  });
  assert.ok(split, "Desktop service heading sits left of accordion");
  assert.equal(
    await page
      .locator(".service-accordion img")
      .first()
      .evaluate((el) => getComputedStyle(el).objectFit),
    "cover",
  );
  await page.locator(".nav-cta").click();
  assert.equal(
    await page
      .locator(".contact-dialog")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    "rgb(11, 11, 11)",
  );
  await page
    .getByRole("textbox", { name: "Name", exact: false })
    .fill("Theme preview");
  await page.screenshot({ path: "qa/theme/dark-contact.png" });
  await page.keyboard.press("Escape");
  await page.locator(".work").scrollIntoViewIfNeeded();
  await page.waitForFunction(
    () => document.querySelector(".work").dataset.progress !== undefined,
  );
  const bounds = await page.locator(".work").evaluate((el) => ({
    top: el.getBoundingClientRect().top + scrollY,
    distance: el.offsetHeight - innerHeight * 0.25,
    viewport: innerHeight,
  }));
  assert.ok(
    Math.abs(bounds.distance / bounds.viewport - 4.125) < 0.005,
    "Project animation uses exactly 25% less scrolling",
  );
  assert.equal(await page.locator(".work-rule").count(), 0);
  await page.evaluate(
    (y) => scrollTo({ top: y, behavior: "instant" }),
    bounds.top - 350,
  );
  await page.waitForTimeout(900);
  await page.screenshot({ path: "qa/theme/projects-entry.png" });
  const opened = [];
  for (const progress of [0.28, 0.42, 0.62]) {
    const y = bounds.top - bounds.viewport * 0.75 + bounds.distance * progress;
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
    await page.waitForTimeout(800);
    await page.screenshot({ path: `qa/theme/ribbon-${progress}.png` });
    let hit = false;
    for (const y of [450, 350, 550, 250, 650]) {
      for (const x of [720, 480, 960, 240, 1200]) {
        await page.mouse.move(x, y);
        if (
          await page
            .locator(".work-canvas")
            .evaluate((el) => el.style.cursor === "pointer")
        ) {
          await page.evaluate(() => scrollBy({ top: 8, behavior: "instant" }));
          await page.mouse.down();
          await page.mouse.up();
          await page.locator(".project-dialog").waitFor();
          opened.push(await page.locator(".project-dialog h2").textContent());
          hit = true;
          break;
        }
      }
      if (hit) break;
    }
    assert.ok(hit, "Moving ribbon cards are clickable before settling");
    await page.locator(".project-dialog .ag-panel").first().click();
    assert.equal(
      await page
        .locator(".photo-viewer")
        .evaluate((el) => getComputedStyle(el).backgroundColor),
      "rgb(11, 11, 11)",
    );
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
  }
  await page.goto("http://127.0.0.1:3000/work/wcdonalds", {
    waitUntil: "networkidle",
  });
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await page.screenshot({ path: "qa/theme/dark-case.png" });
  await page.getByRole("button", { name: "Switch to light mode" }).focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(
    await page
      .getByRole("button", { name: "Switch to dark mode" })
      .getAttribute("aria-pressed"),
    "false",
  );
  for (const width of [600, 390, 360]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
    if (await page.getByRole("button", { name: "Switch to dark mode" }).count())
      await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await page.screenshot({ path: `qa/theme/hero-${width}.png` });
    await page.locator(".services").scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `qa/theme/services-${width}.png` });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.goto("http://127.0.0.1:3000/work/wcdonalds", {
      waitUntil: "networkidle",
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({ path: `qa/theme/case-${width}.png` });
  }
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        theme: "persisted, keyboard and responsive checks passed",
        scrollDistanceVh: (bounds.distance / bounds.viewport) * 100,
        movingProjectsOpened: opened,
        errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
