"use client";

import { signInWithGoogle } from "@/lib/supabase-client";

type SignInButtonProps = {
  children: React.ReactNode;
};

export function SignInButton({ children }: SignInButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        void signInWithGoogle();
      }}
      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-medium"
    >
      {children}
      Google
    </button>
  );
}
