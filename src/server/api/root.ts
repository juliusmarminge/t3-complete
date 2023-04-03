import { z } from "zod";

import { postRouter } from "./routers/post";
import { createTRPCRouter, publicProcedure } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }))
    .query(({ input }) => {
      return {
        greeting: `Hello from tRPC, ${input.text ?? "Anonymous"}`,
      };
    }),
  post: postRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
