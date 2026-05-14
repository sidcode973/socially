import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid Email or Password");
        }

        const isPasswordMatched = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordMatched) {
          throw new Error("Invalid Email or Password");
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.AUTH_SECRET,

  callbacks: {
    /**
     * Ensure a `User` row exists for OAuth sign-ins (Google / GitHub) and
     * keep the avatar synced with the latest one from the provider.
     */
    async signIn({ user, account }) {
      const isOAuth = account?.provider === "google" || account?.provider === "github";
      if (!isOAuth || !user.email) return true;

      const existing = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, image: true },
      });

      if (!existing) {
        // Derive a unique username from the email local-part
        const base =
          user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 16) ||
          "user";
        let username = base;
        // Add suffix if taken (try up to 5 times)
        for (let i = 0; i < 5; i++) {
          const taken = await prisma.user.findUnique({ where: { username } });
          if (!taken) break;
          username = `${base}_${Math.floor(Math.random() * 10000)}`;
        }

        await prisma.user.create({
          data: {
            email: user.email,
            username,
            name: user.name ?? null,
            image: user.image ?? null,
          },
        });
      } else if (user.image && existing.image !== user.image) {
        // Refresh stale avatar
        await prisma.user.update({
          where: { id: existing.id },
          data: { image: user.image },
        });
      }

      return true;
    },
  },
};
