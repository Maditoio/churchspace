import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/types";

const authConfig = {
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
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
        session.user.role = ((user as { role?: UserRole } | undefined)?.role ?? (token.role as UserRole | undefined)) ?? "USER";
        session.user.name = user?.name ?? session.user.name;
        session.user.email = user?.email ?? session.user.email;
        session.user.image = user?.image ?? session.user.image;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;