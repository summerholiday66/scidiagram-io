import { NextResponse } from "next/server";
import { capturePayPalOrder, getPayPalAccessToken } from "@/lib/paypal";
import { setUserProStatus } from "@/lib/pro-status";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type CaptureOrderBody = {
  orderId?: string;
};

export const runtime = "edge";

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Please sign in before confirming payment." }, { status: 401 });
  }

  const body = (await request.json()) as CaptureOrderBody;
  const orderId = body.orderId?.trim();
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase server access is not configured." }, { status: 503 });
  }

  try {
    const accessToken = await getPayPalAccessToken();
    const order = await capturePayPalOrder(accessToken, orderId);
    const purchaseUnit = order.purchase_units?.[0];
    const paypalUserId = purchaseUnit?.custom_id?.trim() ?? "";
    const captureStatus = purchaseUnit?.payments?.captures?.[0]?.status ?? order.status ?? "";

    if (paypalUserId !== auth.user.id) {
      return NextResponse.json({ error: "This PayPal order belongs to another user." }, { status: 403 });
    }

    if (captureStatus !== "COMPLETED") {
      return NextResponse.json({ error: "PayPal payment is not completed yet." }, { status: 409 });
    }

    await setUserProStatus(supabase, auth.user.id);

    return NextResponse.json({
      success: true,
      isPro: true
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to capture PayPal order."
      },
      { status: 500 }
    );
  }
}
