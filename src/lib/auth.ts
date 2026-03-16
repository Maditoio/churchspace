import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/types";
import { signInSchema } from "@/lib/validations";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        if (!user || !user.password || !user.isActive) {
          return null;
        }

        const isValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    Resend({
      from: process.env.RESEND_FROM_EMAIL,
      apiKey: process.env.RESEND_API_KEY,
    }),
  ],
  callbacks: {
    authorized({ auth: session, request }) {
      const isLoggedIn = !!session?.user;
      const pathname = request.nextUrl.pathname;

      if (pathname.startsWith("/dashboard")) {
        return isLoggedIn;
      }

      if (pathname.startsWith("/admin")) {
        return isLoggedIn && session?.user?.role === "SUPER_ADMIN";
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: UserRole }).role ?? "USER";
      }
      return token;
    },
    session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id ?? token.sub ?? "";
        session.user.role = ((user as { role?: UserRole } | undefined)?.role ?? token.role as UserRole | undefined) ?? "USER";
        session.user.name = user?.name ?? session.user.name;
        session.user.email = user?.email ?? session.user.email;
        session.user.image = user?.image ?? session.user.image;
      }
      return session;
    },
  },
});
