import { expect, it } from "vitest";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { type RouterInputs } from "~/utils/api";

it("unauthed user should not be possible to create a post", async () => {
  const ctx = await createInnerTRPCContext({ session: null });
  const caller = appRouter.createCaller(ctx);

  const input: RouterInputs["post"]["create"] = {
    title: "hello test",
    body: "hello test with a long input",
    category: "ENGINEERING",
  };

  await expect(caller.post.create(input)).rejects.toThrowError();
});

it("post should be get-able after created", async () => {
  const user = await prisma.user.upsert({
    where: { email: "test@test.com" },
    create: { name: "test", email: "test@test.com", image: "" },
    update: {},
  });
  const ctx = await createInnerTRPCContext({
    session: {
      user,
      expires: "1",
    },
  });
  const caller = appRouter.createCaller(ctx);

  const input: RouterInputs["post"]["create"] = {
    title: "hello test",
    body: "hello test with a long input",
    category: "ENGINEERING",
  };

  const post = await caller.post.create(input);
  const byId = await caller.post.byId({ id: post.id });

  expect(byId).toMatchObject(input);
});
