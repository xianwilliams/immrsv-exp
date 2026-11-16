import { chromium } from "playwright-core";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
await fs.mkdir("qa", { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const report = { desktop: {}, mobile: {}, reduced: {}, api: {}, errors: [] };
async function pageFor(width, height, reducedMotion = "no-preference") {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion,
  });
  await context.addInitScript(() => {
    Element.prototype.requestPointerLock = () => Promise.resolve();
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => report.errors.push(e.message));
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(2800);
  return page;
}
const page = await pageFor(1440, 900);
for (const [origin, expected] of [
  ["http://127.0.0.1:3000", 400],
  ["https://unrelated.example", 403],
  ["null", 403],
]) {
  const response = await page.request.post(
    "http://127.0.0.1:3000/api/inquiry",
    { headers: { origin }, data: {} },
  );
  report.api[origin] = response.status();
  assert.equal(response.status(), expected);
}
let deliverSuccessfully = false;
await page.route("**/api/inquiry", (route) =>
  route.fulfill({
    status: deliverSuccessfully ? 200 : 503,
    contentType: "application/json",
    body: JSON.stringify(
      deliverSuccessfully
        ? { sent: true }
        : {
            error:
              "Please send your message directly by email using the link below.",
            emailFallback: true,
          },
    ),
  }),
);
await page.screenshot({ path: "qa/desktop-hero.png" });
report.desktop.hero = await page.locator(".hero").boundingBox();
report.desktop.heroCarousel = await page
  .locator(".hero-photo-track")
  .evaluate((el) => ({
    state: getComputedStyle(el).animationPlayState,
    photos: el.querySelectorAll("img").length,
  }));
for (const name of ["trust", "services", "clients"]) {
  await page.locator("." + name).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `qa/desktop-${name}.png` });
}
await page.locator(".service-accordion .ag-panel").nth(4).click();
await page.waitForTimeout(650);
report.desktop.service = await page
  .locator(".service-selection h3")
  .textContent();
await page.locator(".service-accordion .ag-panel").nth(4).press("ArrowRight");
await page.waitForTimeout(650);
report.desktop.serviceKeyboard = await page
  .locator(".service-selection h3")
  .textContent();
await page.locator(".service-accordion .ag-panel").nth(1).click();
await page.waitForTimeout(40);
await page.locator(".service-accordion .ag-panel").nth(5).click();
await page.waitForTimeout(500);
report.desktop.rapidServiceChange =
  (await page
    .locator(".service-accordion .ag-panel")
    .nth(5)
    .getAttribute("aria-current")) === "true" &&
  (await page.locator(".service-selection h3").textContent()).trim() ===
    "And then some |";
assert.equal(report.desktop.rapidServiceChange, true);
const bounds = await page.locator(".work").evaluate((el) => ({
  top: el.getBoundingClientRect().top + scrollY,
  height: el.getBoundingClientRect().height,
}));
for (const [i, p] of [0, 0.25, 0.5, 0.75, 1].entries()) {
  await page.evaluate(
    (y) => window.scrollTo(0, y),
    bounds.top + (bounds.height - 900) * p,
  );
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `qa/work-${i}.png` });
}
await page.evaluate(
  (y) => window.scrollTo({ top: y, behavior: "instant" }),
  bounds.top,
);
await page.waitForTimeout(1000);
await page.locator(".work-view-button").focus();
await page.keyboard.press("Enter");
await page.waitForTimeout(900);
report.desktop.keyboardGallery = await page
  .locator(".work-card")
  .first()
  .evaluate(
    (el) =>
      document.activeElement === el &&
      getComputedStyle(el).visibility === "visible",
  );
assert.equal(report.desktop.keyboardGallery, true);
await page.locator(".work-card").first().click();
await page.waitForTimeout(350);
report.desktop.project = await page
  .getByRole("dialog")
  .getByRole("heading")
  .textContent();
await page.screenshot({ path: "qa/project-dialog.png" });
await page.keyboard.press("Escape");
await page.waitForTimeout(200);
report.desktop.projectFocusRestored = await page
  .locator(".work-card")
  .first()
  .evaluate((el) => document.activeElement === el);
assert.equal(report.desktop.projectFocusRestored, true);
await page.locator(".work-card").first().click();
await page
  .getByRole("dialog")
  .getByRole("button", { name: "WORK WITH US", exact: true })
  .click();
await page.waitForTimeout(500);
report.desktop.projectContactHandoff =
  (await page.locator(".contact-dialog").isVisible()) &&
  (await page
    .getByRole("dialog")
    .evaluate((el) => el.contains(document.activeElement)));
assert.equal(report.desktop.projectContactHandoff, true);
await page.keyboard.press("Escape");
await page.waitForTimeout(200);
assert.equal(
  await page
    .locator(".work-card")
    .first()
    .evaluate((el) => document.activeElement === el),
  true,
);
await page.getByRole("button", { name: "Next review", exact: true }).click();
report.desktop.review = await page
  .locator(".review-attribution strong")
  .textContent();
await page.locator(".nav-cta").click();
await page.waitForTimeout(350);
await page.screenshot({ path: "qa/contact.png" });
report.desktop.dialog = await page.getByRole("dialog").isVisible();
await page
  .getByRole("button", { name: "Pause contact video", exact: true })
  .click();
report.desktop.contactVideoPaused = await page
  .locator(".contact-visual video")
  .evaluate((v) => v.paused);
assert.equal(report.desktop.contactVideoPaused, true);
await page
  .getByRole("textbox", { name: "Name", exact: false })
  .fill("Preview test");
await page
  .getByRole("textbox", { name: "Email address", exact: false })
  .fill("preview@example.com");
await page
  .getByRole("textbox", { name: "Subject", exact: false })
  .fill("Local validation test");
await page
  .getByRole("textbox", { name: "What’s up?", exact: false })
  .fill("Testing the local form without a configured email provider.");
await page.getByRole("button", { name: "LET’S TALK", exact: true }).click();
await page.waitForTimeout(1000);
report.desktop.formFallback = await page.getByRole("alert").textContent();
report.desktop.noFalseSuccess =
  (await page.getByText("You’re on our radar.").count()) === 0;
deliverSuccessfully = true;
await page.getByRole("button", { name: "LET’S TALK", exact: true }).click();
await page.getByText("You’re on our radar.").waitFor();
await page.keyboard.press("Escape");
await page.waitForTimeout(200);
report.desktop.closed = (await page.getByRole("dialog").count()) === 0;
report.desktop.focusRestored = await page
  .locator(".nav-cta")
  .evaluate((el) => document.activeElement === el);
assert.equal(report.desktop.focusRestored, true);
await page.locator(".nav-cta").click();
await page.waitForTimeout(350);
report.desktop.newInquiry =
  (await page
    .getByRole("textbox", { name: "Name", exact: false })
    .isVisible()) &&
  (await page.getByText("You’re on our radar.").count()) === 0;
assert.equal(report.desktop.newInquiry, true);
await page.keyboard.press("Escape");
report.desktop.brokenImages = await page
  .locator("img")
  .evaluateAll((imgs) =>
    imgs.filter((i) => !i.complete || !i.naturalWidth).map((i) => i.src),
  );
report.desktop.overflow = await page.evaluate(
  () => document.documentElement.scrollWidth > innerWidth,
);
for (const [key, width, height, motion] of [
  ["mobile", 390, 844, "no-preference"],
  ["reduced", 1440, 900, "reduce"],
  ["compact", 360, 640, "reduce"],
]) {
  const p = await pageFor(width, height, motion);
  report[key] = {};
  await p.screenshot({ path: `qa/${key}-hero.png` });
  report[key].overflow = await p.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  await p.locator(".work").scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  await p.screenshot({ path: `qa/${key}-work.png` });
  await p.locator(".nav-cta").click();
  await p.waitForTimeout(350);
  await p.screenshot({ path: `qa/${key}-contact.png` });
  report[key].dialog = await p.getByRole("dialog").isVisible();
  if (motion === "reduce") {
    report[key].heroCarouselPaused = await p
      .locator(".hero-photo-track")
      .evaluate((el) => getComputedStyle(el).animationPlayState === "paused");
    assert.equal(report[key].heroCarouselPaused, true);
  }
  report[key].dialogFits = await p.getByRole("dialog").evaluate((el) => {
    const b = el.getBoundingClientRect();
    return (
      b.left >= 0 &&
      b.right <= innerWidth &&
      b.top >= 0 &&
      b.bottom <= innerHeight
    );
  });
  assert.equal(report[key].dialogFits, true);
  await p.keyboard.press("Escape");
  if (key === "mobile") {
    await p.getByRole("button", { name: "Toggle navigation" }).click();
    report[key].menu = await p
      .getByRole("navigation", { name: "Mobile navigation" })
      .isVisible();
  }
  await p.close();
}
await fs.writeFile("qa/report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
if (
  report.errors.length ||
  report.desktop.brokenImages.length ||
  Object.values(report).some((v) => v?.overflow)
)
  process.exitCode = 1;
