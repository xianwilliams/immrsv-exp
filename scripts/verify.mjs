import { chromium } from "playwright-core";
import fs from "node:fs/promises";
import assert from "node:assert/strict";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:3100";
const galleries = JSON.parse(
  await fs.readFile("lib/approved-images.json", "utf8"),
);
const report = { viewports: [], projects: [], errors: [], retiredRoutes: [] };
await fs.mkdir("qa", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
async function newPage(width, height, reducedMotion = "reduce") {
  const ctx = await browser.newContext({
    viewport: { width, height },
    reducedMotion,
  });
  await ctx.addInitScript(() => {
    Element.prototype.requestPointerLock = () => Promise.resolve();
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
  });
  const page = await ctx.newPage();
  // Browser checks must never send real inquiries, even with a configured key.
  await page.route("https://api.web3forms.com/submit", (route) =>
    route.fulfill({ json: { success: true } }),
  );
  page.on("pageerror", (e) => report.errors.push(e.message));
  return page;
}
try {
  for (const [width, height] of [
    [1440, 900],
    [768, 1024],
    [390, 844],
    [320, 640],
  ]) {
    const page = await newPage(width, height);
    await page.goto(baseURL, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      heroBottom: document
        .querySelector(".hero-slideshow")
        .getBoundingClientRect().bottom,
      sections: [...document.querySelectorAll("main > section")].map(
        (e) => e.id,
      ),
    }));
    assert(layout.scrollWidth <= width, `Overflow at ${width}`);
    assert(layout.heroBottom <= height, `Reel does not fit at ${width}`);
    assert.deepEqual(layout.sections, [
      "about",
      "services",
      "clients",
      "work",
      "contact",
    ]);
    assert.equal(await page.locator(".work-card").count(), 10);
    assert.equal(
      await page
        .locator("#services img, .review-stage, .contact-dialog, .work-canvas")
        .count(),
      0,
    );
    await page.screenshot({ path: `qa/revision-hero-${width}.png` });
    await page.locator("#services summary").nth(1).click();
    assert.equal(await page.locator("#services details[open]").count(), 1);
    assert.match(
      await page.locator("#services details[open]").innerText(),
      /10–20-hour/,
    );
    await page.locator("#services summary").nth(2).focus();
    await page.keyboard.press("Enter");
    assert.match(
      await page.locator("#services details[open]").innerText(),
      /3D renderings/,
    );
    for (const card of await page.locator(".work-card").all()) {
      await card.scrollIntoViewIfNeeded();
      await card.locator("img").evaluate((img) => img.decode());
    }
    for (const logo of await page.locator(".client-logo-button img").all()) {
      await logo.evaluate((img) => img.decode());
    }
    await page.locator(".work-card").first().click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    await dialog.evaluate((el) =>
      Promise.all(el.getAnimations().map((animation) => animation.finished)),
    );
    const bounds = await dialog.boundingBox();
    assert(
      bounds.x >= 0 &&
        bounds.x + bounds.width <= width + 1 &&
        bounds.y >= 0 &&
        bounds.y + bounds.height <= height + 1,
      `Dialog bounds at ${width}`,
    );
    await page.locator(".ag-panel").first().click();
    await page.getByRole("button", { name: "Close full screen image" }).click();
    await page
      .getByRole("button", { name: "Close dialog", exact: true })
      .click();
    await page.waitForFunction(
      () => document.activeElement === document.querySelector(".work-card"),
    );
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    for (const selector of ["#clients", ".site-footer"]) {
      assert.equal(
        await page
          .locator(selector)
          .evaluate((el) => getComputedStyle(el).backgroundColor),
        "rgb(0, 0, 0)",
      );
    }
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector("#about")).color ===
        "rgb(242, 242, 239)",
    );
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Switch to light mode" }).waitFor();
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `qa/revision-dark-contact-${width}.png` });
    await page
      .getByRole("textbox", { name: "Name", exact: false })
      .fill("Local preview check");
    await page
      .getByRole("textbox", { name: "Email address" })
      .fill("preview@example.com");
    await page.getByRole("textbox", { name: "Subject" }).fill("Preview only");
    await page
      .getByRole("textbox", { name: "What’s up?" })
      .fill("Local verification. Do not send.");
    // No actual emails are sent during local verification.
    if (
      await page
        .getByRole("button", { name: "PREPARE EMAIL", exact: true })
        .count()
    ) {
      await page
        .getByRole("button", { name: "PREPARE EMAIL", exact: true })
        .click();
      const draft = page.getByRole("link", { name: "OPEN EMAIL DRAFT" });
      await draft.waitFor();
      assert(
        (await draft.getAttribute("href")).startsWith(
          "mailto:nick@immrsv-exp.com?",
        ),
      );
      assert.match(
        await page.locator(".email-draft").innerText(),
        /not been sent/,
      );
    } else {
      await page
        .getByRole("button", { name: "SEND MESSAGE", exact: true })
        .click();
      await page
        .getByRole("heading", { name: "Thanks for reaching out." })
        .waitFor();
    }
    report.viewports.push(layout);
    await page.context().close();
  }
  const page = await newPage(1440, 900, "no-preference");
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.waitForFunction(
    () => getComputedStyle(document.querySelector(".intro")).display === "none",
  );
  const starting = await page
    .locator(".hero-slideshow-frame img.active")
    .getAttribute("src");
  await page.waitForFunction(
    (src) =>
      document
        .querySelector(".hero-slideshow-frame img.active")
        .getAttribute("src") !== src,
    starting,
    { timeout: 10000 },
  );
  await page.getByRole("button", { name: "Pause featured projects" }).click();
  const paused = await page
    .locator(".hero-slideshow-frame img.active")
    .getAttribute("src");
  await page.waitForTimeout(5600);
  assert.equal(
    await page.locator(".hero-slideshow-frame img.active").getAttribute("src"),
    paused,
  );
  await page
    .locator("#clients")
    .evaluate((el) =>
      el.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  await page.waitForTimeout(1000);
  const lastBrand = page.locator(".client-mark").last();
  await lastBrand.hover();
  await page.waitForTimeout(300);
  assert(await lastBrand.locator(".client-event-preview").isVisible());
  assert(
    await lastBrand.locator(".client-event-preview").evaluate((el) => {
      const b = el.getBoundingClientRect();
      const y = Math.min(innerHeight - 2, b.bottom - 8);
      return el.contains(document.elementFromPoint(b.left + b.width / 2, y));
    }),
    "Brand preview must stay above the next section",
  );
  await page.screenshot({ path: "qa/revision-client-preview.png" });
  for (const [id, photos] of Object.entries(galleries)) {
    const response = await page.goto(`${baseURL}/work/${id}`, {
      waitUntil: "networkidle",
    });
    assert.equal(response.status(), 200, id);
    assert.equal(await page.locator(".case-photo").count(), photos.length - 1);
    for (const img of await page
      .locator(".case-lead img, .case-photo img")
      .all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((el) => el.decode());
    }
    assert.equal(await page.locator(".case-contact-photos img").count(), 6);
    assert.equal(await page.locator('img[src*="inevent"]').count(), 0);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    report.projects.push({ id, photos: photos.length });
  }
  for (const id of [
    "wcdonalds",
    "sundance",
    "nascar-billboard",
    "stones",
    "tictac",
    "fourloko",
    "keebler",
  ]) {
    const response = await page.goto(`${baseURL}/work/${id}`);
    assert.equal(response.status(), 404, id);
    report.retiredRoutes.push(id);
  }
  await page.goto(`${baseURL}/work/starry`);
  await page.locator(".case-header .nav-cta").click();
  await page.waitForURL("**/#contact");
  assert.equal(await page.getByRole("dialog").count(), 0);
  await page.waitForFunction(
    () => document.querySelector("#contact").getBoundingClientRect().top < 900,
  );
  await page.context().close();
  assert.deepEqual(report.errors, []);
} finally {
  await fs.writeFile(
    "qa/revision-verification.json",
    JSON.stringify(report, null, 2),
  );
  await browser.close();
}
console.log(JSON.stringify(report, null, 2));
