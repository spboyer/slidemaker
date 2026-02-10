"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function UserMenu() {
  const authEnabled =
    typeof window !== "undefined"
      ? document.documentElement.dataset.authEnabled === "true"
      : false;

  const { data: session, status } = useSession();

  if (!authEnabled) {
    return (
      <span className="rounded bg-amber-600/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
        Dev Mode
      </span>
    );
  }

  if (status === "loading") {
    return (
      <span className="h-5 w-5 animate-pulse rounded-full bg-white/20" />
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-1.5">
        {session.user.image && (
          <img
            src={session.user.image}
            alt={session.user.name ?? "User"}
            className="h-5 w-5 rounded-full"
          />
        )}
        <span className="text-xs text-white/70">
          {(session.user as { username?: string }).username ??
            session.user.name}
        </span>
        <button
          onClick={() => signOut()}
          className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/60 transition-colors hover:bg-white/20 hover:text-white"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("github")}
      className="rounded bg-white/10 px-2 py-1 text-xs text-white transition-colors hover:bg-white/20"
    >
      Sign in with GitHub
    </button>
  );
}