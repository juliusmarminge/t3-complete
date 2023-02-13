import { expect, test } from "@playwright/test";

test("sign in a user", async ({ page }) => {
  await page.goto("/");

  // sign in a user
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByPlaceholder("Name").type("test user");
  await page.getByRole("button", { name: "Sign in" }).click();

  // user name should be displayed from trpc greeting
  await expect(page.getByText("Hello from tRPC, test user")).toBeVisible();
});

test("write a post", async ({ page }) => {
  await page.goto("/");

  // sign in a user
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByPlaceholder("Name").type("test user");
  await page.getByRole("button", { name: "Sign in" }).click();

  // go to posts page, fill title, body and category and click submit
  await page.getByRole("link", { name: "Posts" }).click();
  await page.getByRole("textbox", { name: "Title" }).type("testy");
  await page.getByRole("textbox", { name: "Body" }).type("short post body");
  await page.getByText("Select a category").click();
  await page.getByRole("option", { name: "ENGINEERING" }).click();
  await page.getByRole("button").getByText("Post").click();

  // initial post should fail due to body being too short
  await expect(page.getByText("must contain at least 20")).toBeVisible();
  await page.getByRole("textbox", { name: "Body" }).type(" with looong body");
  await page.getByRole("button").getByText("Post").click();

  // post should be visible on the page
  // FIXME: we get back unauthorized from server since we can't use db strategy
  // await expect(page.getByText("testy")).toBeVisible();
  // await expect(
  //   page.getByText("short post body with looong body"),
  // ).toBeVisible();
});
