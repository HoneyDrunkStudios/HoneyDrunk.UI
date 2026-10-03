import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";

const pageErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = [];
  pageErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
});
test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page)).toEqual([]);
});

test("keyboard activates enabled controls with a visible focus outline", async ({
  page,
}) => {
  const activate = page.getByRole("button", { name: "Activate", exact: true });
  await page.keyboard.press("Tab");
  await expect(activate).toBeFocused();
  await expect(activate).toHaveCSS("outline-width", "2px");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("count")).toHaveText("Activations: 1");
  await page.keyboard.press("Space");
  await expect(page.getByTestId("count")).toHaveText("Activations: 2");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Busy action", exact: true }),
  ).toBeFocused();
  const box = await activate.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(48);
  expect(box.width).toBeGreaterThanOrEqual(48);
});

test("disabled and busy actions block activation including synthetic events", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Disabled", exact: true })
    .dispatchEvent("click");
  await page.getByRole("button", { name: "Toggle busy", exact: true }).click();
  const busy = page.getByRole("button", { name: "Busy action", exact: true });
  await expect(busy).toHaveAttribute("aria-busy", "true");
  await expect(busy).toHaveAttribute("aria-disabled", "true");
  await busy.dispatchEvent("click");
  await expect(page.getByTestId("count")).toHaveText("Activations: 0");
  await page.getByRole("button", { name: "Toggle busy", exact: true }).click();
  await busy.click();
  await expect(page.getByTestId("count")).toHaveText("Activations: 1");
});

test("theme and error updates preserve input identity, focus and uncontrolled value", async ({
  page,
}) => {
  const input = page.getByRole("textbox", { name: "Name", exact: true });
  await input.fill("Grace");
  await input.evaluate((element) => {
    window.originalInput = element;
  });
  const surface = page.getByTestId("surface");
  const before = await surface.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await page.getByRole("button", { name: "Switch theme", exact: true }).click();
  expect(
    await surface.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
  ).not.toBe(before);
  await input.focus();
  await expect(input).toHaveCSS("outline-width", "2px");
  await page
    .getByRole("button", { name: "Toggle error", exact: true })
    .dispatchEvent("click");
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("Grace");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  const id = await input.getAttribute("aria-describedby");
  await expect(page.locator(`[id="${id}"]`)).toHaveText("Name needs attention");
  await page
    .getByRole("button", { name: "Toggle error", exact: true })
    .dispatchEvent("click");
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
  await expect(input).toBeFocused();
  expect(
    await input.evaluate((element) => element === window.originalInput),
  ).toBe(true);
  await expect(
    page.getByRole("textbox", { name: "Read only", exact: true }),
  ).toHaveAttribute("readonly", "");
});

test("both themes and visible busy/error states have no axe WCAG A/AA violations", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Toggle error", exact: true }).click();
  await page.getByRole("button", { name: "Toggle busy", exact: true }).click();
  await mkdir("artifacts/screenshots", { recursive: true });
  for (const name of ["dark", "light"]) {
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
    await page.screenshot({
      path: `artifacts/screenshots/${name}.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Switch theme", exact: true })
      .click();
  }
});

test("progress fill follows RTL and exposes a named numeric value", async ({
  page,
}) => {
  await page.goto("/?dir=rtl");
  const progress = page.getByRole("progressbar", {
    name: "Completion",
    exact: true,
  });
  await expect(progress).toHaveAttribute("aria-valuenow", "25");
  await expect(progress).toHaveAttribute("aria-valuetext", "25 percent");
  const track = progress.locator('[aria-hidden="true"]');
  const fill = track.locator(":scope > div");
  const trackBox = await track.boundingBox(),
    fillBox = await fill.boundingBox();
  expect(
    Math.abs(fillBox.x + fillBox.width - trackBox.x - trackBox.width),
  ).toBeLessThanOrEqual(1.1);
  expect(Math.abs(fillBox.width / trackBox.width - 0.25)).toBeLessThan(0.01);
});

test("narrow layout permits twofold text growth and reduced motion uses a static loader", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?scale=2");
  const loading = page.getByRole("progressbar", {
    name: "Loading information",
    exact: true,
  });
  await expect(loading).toHaveText("Loading information");
  await expect(loading).toHaveAttribute("aria-busy", "true");
  const longAction = page.getByRole("button", { name: /^A long action label/ });
  await longAction.scrollIntoViewIfNeeded();
  const box = await longAction.boundingBox();
  expect(box.height).toBeGreaterThan(48);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(longAction).toBeVisible();
  await mkdir("artifacts/screenshots", { recursive: true });
  await page.screenshot({
    path: "artifacts/screenshots/large-text.png",
    fullPage: true,
  });
});

test("loading follows reduced-motion preference changes while mounted", async ({
  page,
}) => {
  const loading = page.getByRole("progressbar", {
    name: "Loading information",
    exact: true,
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(loading).not.toHaveText("Loading information");
  await expect(loading).toHaveAttribute("aria-busy", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(loading).toHaveText("Loading information");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(loading).not.toHaveText("Loading information");
});

for (const removed of ["first", "second"]) {
  test(`multiple loaders retain motion updates after removing the ${removed} loader`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/?loaders");
    const first = page.getByRole("progressbar", {
      name: "First loader",
      exact: true,
    });
    const second = page.getByRole("progressbar", {
      name: "Second loader",
      exact: true,
    });
    await expect(first).toBeVisible();
    await expect(second).toBeVisible();
    await expect(first).toHaveText("");
    await expect(second).toHaveText("");
    await page
      .getByRole("button", { name: `Toggle ${removed} loader`, exact: true })
      .click();
    const remaining = removed === "first" ? second : first;
    const remainingLabel =
      removed === "first" ? "Second loader" : "First loader";
    await expect(removed === "first" ? first : second).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(remaining).toHaveText(remainingLabel);
    await expect(remaining).toHaveAttribute("aria-busy", "true");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(remaining).toHaveText("");

    // Dispose the final subscriber, change the preference, then reconnect both.
    const other = removed === "first" ? "second" : "first";
    await page
      .getByRole("button", { name: `Toggle ${other} loader`, exact: true })
      .click();
    await expect(page.getByRole("progressbar")).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page
      .getByRole("button", { name: "Toggle first loader", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Toggle second loader", exact: true })
      .click();
    await expect(first).toHaveText("First loader");
    await expect(second).toHaveText("Second loader");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(first).toHaveText("");
    await expect(second).toHaveText("");
  });
}
