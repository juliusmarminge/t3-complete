import { test } from "@playwright/test";

test.setTimeout(35e3);

test("send message", async ({ browser, page }) => {
  const viewer = await browser.newPage();
  await viewer.goto("/");

  // Sign in a test user
  await page.getByText("Sign in").click();
  await page.getByLabel("Name").type("test user 123");
  await page.getByText("Sign in with Mocked Provider").click();

  await viewer.waitForSelector(`text=test user 123`);

  await viewer.close();
});

export {};
