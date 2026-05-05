import { NextResponse } from "next/server";
import { getPayPalAccessToken, getPayPalOrder, getPayPalWebhookId, verifyPayPalWebhookSignature } from "@/lib/paypal";
import { setUserProStatus } from "@/lib/pro-status";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type PayPalWebhookEvent = {
  event_type?: string;
  resource?: {
    id?: string;
    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
  };
};

export const runtime = "edge";

function readHeader(headers: Headers, name: string) {
  return headers.get(name)?.trim() ?? "";
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!rawBody) {
    return NextResponse.json({ error: "Webhook body is required." }, { status: 400 });
  }

  let event: PayPalWebhookEvent;

  try {
    event = JSON.parse(rawBody) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Webhook body must be valid JSON." }, { status: 400 });
  }

  try {
    const accessToken = await getPayPalAccessToken();
    const webhookId = getPayPalWebhookId();
    const verified = await verifyPayPalWebhookSignature(accessToken, {
      authAlgo: readHeader(request.headers, "PAYPAL-AUTH-ALGO"),
      certUrl: readHeader(request.headers, "PAYPAL-CERT-URL"),
      transmissionId: readHeader(request.headers, "PAYPAL-TRANSMISSION-ID"),
      transmissionSig: readHeader(request.headers, "PAYPAL-TRANSMISSION-SIG"),
      transmissionTime: readHeader(request.headers, "PAYPAL-TRANSMISSION-TIME"),
      webhookId,
      webhookEvent: event
    });

    if (!verified) {
      return NextResponse.json({ error: "PayPal webhook signature verification failed." }, { status: 400 });
    }

    if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
      return NextResponse.json({ ok: true, handled: false, eventType: event.event_type ?? "unknown" });
    }

    const orderId = event.resource?.supplementary_data?.related_ids?.order_id?.trim() ?? "";
    if (!orderId) {
      return NextResponse.json({ error: "Missing related PayPal order ID." }, { status: 400 });
    }

    const order = await getPayPalOrder(accessToken, orderId);
    const userId = order.purchase_units?.[0]?.custom_id?.trim() ?? "";

    if (!userId) {
      return NextResponse.json({ error: "Unable to resolve user from PayPal order." }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase server access is not configured." }, { status: 503 });
    }

    await setUserProStatus(supabase, userId);

    return NextResponse.json({
      ok: true,
      handled: true,
      isPro: true
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to process PayPal webhook."
      },
      { status: 500 }
    );
  }
}
