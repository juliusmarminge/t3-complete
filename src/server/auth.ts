import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";

import { env } from "../env.mjs";
import { prisma } from "./db";

/**
 * Module augmentation for `next-auth` types.
 * Allows us to add custom properties to the `session` object and keep type
 * safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 **/
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

// Mocked NextAuth.js provider for testing purposes
const mockProvider = CredentialsProvider({
  id: "discord", // <-- same id so we still match `signIn("discord")` if we use it
  name: "Mocked Provider",
  credentials: {
    name: { label: "Name", type: "text" },
  },
  authorize(credentials) {
    if (credentials) {
      const user = {
        id: credentials.name,
        name: credentials.name,
        email: credentials.name,
        image: "https://github.com/octocat.png",
      };
      return user;
    }
    return null;
  },
});
const useMock = env.NODE_ENV === "test" || !!"overridden";

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks,
 * etc.
 *
 * @see https://next-auth.js.org/configuration/options
 **/

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user, token }) {
      if (session.user && user) {
        session.user.id = user.id;
        // session.user.role = user.role; <-- put other properties on the session here
      } else if (token && useMock) {
        session.user = { ...token, id: token.jti as string };
      } else {
        throw new Error("unreachable state");
      }

      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: useMock
    ? [mockProvider]
    : [
        DiscordProvider({
          clientId: env.DISCORD_CLIENT_ID,
          clientSecret: env.DISCORD_CLIENT_SECRET,
        }),
        /**
         * ...add more providers here
         *
         * Most other providers require a bit more work than the Discord provider.
         * For example, the GitHub provider requires you to add the
         * `refresh_token_expires_in` field to the Account model. Refer to the
         * NextAuth.js docs for the provider you want to use. Example:
         * @see https://next-auth.js.org/providers/github
         **/
      ],
  session: {
    strategy: useMock ? "jwt" : "database",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the
 * `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 **/
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
