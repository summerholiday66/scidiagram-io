import { NextResponse } from "next/server";
import { getUserProStatus } from "@/lib/pro-status";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) {
    return NextResponse.json({ authenticated: false, isPro: false }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase server access is not configured." }, { status: 503 });
  }

  const isPro = await getUserProStatus(supabase, auth.user.id);

  return NextResponse.json({
    authenticated: true,
    isPro
  });
}
