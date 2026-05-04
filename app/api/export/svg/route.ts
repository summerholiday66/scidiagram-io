import { NextResponse } from "next/server";
import { buildDiagramSvg } from "@/lib/diagram-svg";
import { isValidDiagramPayload } from "@/lib/mo-schema";
import { getUserProStatus } from "@/lib/pro-status";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type ExportSvgBody = {
  diagram?: unknown;
};

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Please sign in to download SVG." }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase server access is not configured." }, { status: 503 });
  }

  const isPro = await getUserProStatus(supabase, auth.user.id);
  if (!isPro) {
    return NextResponse.json({ error: "Pro subscription required for HD SVG export." }, { status: 403 });
  }

  const body = (await request.json()) as ExportSvgBody;
  if (!isValidDiagramPayload(body.diagram)) {
    return NextResponse.json({ error: "Invalid diagram payload." }, { status: 400 });
  }

  const svg = buildDiagramSvg(body.diagram);

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${body.diagram.formula.toLowerCase()}-mo-diagram.svg"`
    }
  });
}
