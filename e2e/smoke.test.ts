import { expect, test, type Page } from "@playwright/test";

async function createPost(
  post: { title: string; body: string; category: string },
  page: Page,
) {
  // fill title, body and category and click submit
  await page.getByRole("textbox", { name: "Title" }).type(post.title);
  await page.getByRole("textbox", { name: "Body" }).type(post.body);
  await page.getByText("Select a category").click();
  await page.getByRole("option", { name: post.category }).click();
  await page.getByRole("button").getByText("Post").click();
}

test("write a post", async ({ page }) => {
  await page.goto("/");

  // go to posts page, fill title, body and category and click submit
  await page.getByRole("link", { name: "Posts" }).click();
  await createPost(
    { title: "Testy", body: "short post", category: "DESIGN" },
    page,
  );

  // initial post should fail due to body being too short
  await expect(page.getByText("must contain at least 20")).toBeVisible();
  await page.getByRole("textbox", { name: "Body" }).type(" with looong body");
  await page.getByRole("button").getByText("Post").click();

  // post should be visible on the page
  await expect(page.getByText("testy")).toBeVisible();
  await expect(page.getByText("short post with looong body")).toBeVisible();
});

test("delete a post", async ({ page }) => {
  await page.goto("/posts");

  await createPost(
    {
      title: "Testy Posty",
      body: "This will be a shortlived post",
      category: "ENGINEERING",
    },
    page,
  );

  // post should be visible on the page
  await expect(page.getByText("Testy Posty")).toBeVisible();
  await expect(page.getByText("This will be a shortlived post")).toBeVisible();

  // delete the post
  await page.getByTestId(`delete-post-Testy Posty`).click();
  await page.getByRole("button").getByText("Delete").click();

  // post should be gone
  await expect(page.getByText("Testy Posty")).not.toBeVisible();
});
