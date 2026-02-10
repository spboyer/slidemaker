import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      username?: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.username = (profile as { login?: string }).login;
        token.picture = (profile as { avatar_url?: string }).avatar_url;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.username = (token.username as string) ?? undefined;
        session.user.image = (token.picture as string) ?? undefined;
      }
      return session;
    },
  },
});