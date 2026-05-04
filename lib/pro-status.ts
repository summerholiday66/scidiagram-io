import type { SupabaseClient } from "@supabase/supabase-js";

export async function getUserProStatus(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("user_quota").select("is_pro").eq("user_id", userId).maybeSingle();
  return data?.is_pro === true;
}

export async function setUserProStatus(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase.from("user_quota").upsert(
    {
      user_id: userId,
      is_pro: true
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw new Error(`Failed to update Supabase Pro status: ${error.message}`);
  }
}
