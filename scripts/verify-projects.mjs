import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
await fs.mkdir("qa/projects", { recursive: true });
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
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(2900);
  await page.locator(".work").scrollIntoViewIfNeeded();
  await page.locator(".work-view-button").click();
  await page.waitForTimeout(1000);
  const bounds = await page.locator(".work").evaluate((el) => ({
    top: el.getBoundingClientRect().top + scrollY - innerHeight * 0.75,
    distance:
      el.offsetHeight -
      document.querySelector(".work-stage").clientHeight * 0.25,
  }));
  for (const progress of [
    0, 0.12, 0.24, 0.32, 0.4, 0.48, 0.58, 0.68, 0.82, 1, 0.4,
  ]) {
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      bounds.top + bounds.distance * progress,
    );
    await page.waitForTimeout(1300);
    await page.screenshot({ path: `qa/projects/ribbon-${progress}.png` });
  }
  await page.locator(".work-view-button").click();
  const counts = {};
  const cases = [
    ...Array.from({ length: 6 }, (_, i) => [".work-card", i]),
    ...[3, 4, 6].map((i) => [".project-row", i]),
  ];
  const routes = [];
  for (const [selector, i] of cases) {
    const opener = page.locator(selector).nth(i);
    await opener.click();
    const dialog = page.locator(".project-dialog");
    const title = await dialog.getByRole("heading").textContent();
    const panels = dialog.locator(".ag-panel");
    const count = await panels.count();
    await page.waitForFunction(() =>
      [...document.querySelectorAll(".project-dialog .ag-panel img")].every(
        (img) => img.complete && img.naturalWidth > 0,
      ),
    );
    counts[title] = count;
    assert.ok(count >= 4, `${title} needs varied imagery`);
    const sources = await panels
      .locator("img")
      .evaluateAll((imgs) => imgs.map((img) => img.getAttribute("src")));
    assert.equal(new Set(sources).size, count);
    const route = await dialog
      .getByRole("link", { name: "EXPLORE THE FULL PROJECT" })
      .getAttribute("href");
    routes.push(route);
    if (i === 0 && selector === ".work-card") {
      await page.mouse.move(5, 5);
      const before = await panels.evaluateAll((els) =>
        els.findIndex((el) => el.getAttribute("aria-current") === "true"),
      );
      await page.waitForTimeout(4300);
      const after = await panels.evaluateAll((els) =>
        els.findIndex((el) => el.getAttribute("aria-current") === "true"),
      );
      assert.notEqual(before, after, "Popup accordion automatically advances");
    }
    await dialog
      .getByRole("button", { name: "Pause project slideshow" })
      .click();
    await panels.first().hover();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: `qa/projects/accordion-${selector.slice(1)}-${i}.png`,
    });
    await panels.first().click();
    const viewer = page.locator(".photo-viewer");
    await viewer.waitFor({ state: "visible" });
    await page.keyboard.press("ArrowRight");
    assert.equal(await viewer.locator("img").getAttribute("src"), sources[1]);
    assert.equal(
      await viewer
        .locator("img")
        .evaluate((img) => getComputedStyle(img).objectFit),
      "contain",
    );
    await page.keyboard.press("Escape");
    await viewer.waitFor({ state: "hidden" });
    assert.equal(await dialog.isVisible(), true);
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    await page.waitForFunction(
      (el) => document.activeElement === el,
      await opener.elementHandle(),
    );
  }
  for (const route of routes) {
    const response = await page.goto(`http://127.0.0.1:3000${route}`, {
      waitUntil: "networkidle",
    });
    assert.equal(response.status(), 200);
    assert.equal(await page.locator("h1").count(), 1);
    assert.ok((await page.locator(".case-scope-list article").count()) >= 3);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({
      path: `qa/projects/case-${route.split("/").pop()}.png`,
    });
    await page.locator(".skip-link").focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(700);
    assert.ok(
      await page.evaluate(
        () =>
          document.querySelector(".case-title").getBoundingClientRect().top >=
          document.querySelector(".case-header").getBoundingClientRect().bottom,
      ),
      "Case-page skip target stays below its sticky header",
    );
    await page
      .locator(".case-header")
      .getByRole("button", { name: "WORK WITH US", exact: true })
      .click();
    assert.equal(await page.locator(".contact-dialog").isVisible(), true);
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: /Enlarge project image 1:/ })
      .click();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Escape");
  }
  const invalid = await page.goto(
    "http://127.0.0.1:3000/work/not-a-real-project",
  );
  assert.equal(invalid.status(), 404);
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });
  mobile.on("pageerror", (error) => errors.push(error.message));
  await mobile.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await mobile.waitForTimeout(2800);
  await mobile.locator(".work-card").first().click();
  await mobile.locator(".project-dialog .ag-panel").nth(2).click();
  await mobile.screenshot({ path: "qa/projects/mobile-full-image.png" });
  await mobile.keyboard.press("Escape");
  await mobile.waitForTimeout(800);
  await mobile.screenshot({ path: "qa/projects/mobile-accordion.png" });
  assert.equal(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await mobile.keyboard.press("Escape");
  await mobile.goto("http://127.0.0.1:3000/work/wcdonalds", {
    waitUntil: "networkidle",
  });
  await mobile.screenshot({ path: "qa/projects/mobile-case.png" });
  await mobile.locator(".skip-link").focus();
  await mobile.keyboard.press("Enter");
  await mobile.waitForTimeout(700);
  assert.ok(
    await mobile.evaluate(
      () =>
        document.querySelector(".case-title").getBoundingClientRect().top >=
        document.querySelector(".case-header").getBoundingClientRect().bottom,
    ),
    "Mobile case-page skip target stays below its sticky header",
  );
  await mobile
    .locator(".case-header")
    .getByRole("button", { name: "WORK WITH US", exact: true })
    .click();
  assert.equal(await mobile.locator(".contact-dialog").isVisible(), true);
  await mobile.keyboard.press("Escape");
  await fs.writeFile(
    "qa/projects/report.json",
    JSON.stringify({ counts, routes, errors }, null, 2),
  );
  assert.deepEqual(errors, []);
  console.log(
    "Nine project pages, autoplay accordions, full images, contact access, mobile and ribbon checks passed.",
  );
} finally {
  await browser.close();
}
