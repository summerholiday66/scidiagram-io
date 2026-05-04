import { createClient } from "@supabase/supabase-js";

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey);
}

export async function signInWithGoogle() {
  const client = getSupabaseBrowserClient();

  if (!client) {
    console.warn("Supabase env vars are missing.");
    return;
  }

  await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/editor` : undefined
    }
  });
}

export async function getBrowserAccessToken() {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return "";
  }

  const {
    data: { session }
  } = await client.auth.getSession();

  return session?.access_token ?? "";
}
