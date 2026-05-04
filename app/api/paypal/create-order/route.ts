import { NextResponse } from "next/server";
import { createPayPalOrder, getPayPalAccessToken } from "@/lib/paypal";
import { getAuthenticatedUser } from "@/lib/server-auth";

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Please sign in before upgrading." }, { status: 401 });
  }

  try {
    const accessToken = await getPayPalAccessToken();
    const order = await createPayPalOrder(accessToken, auth.user.id);

    return NextResponse.json({
      orderId: order.id
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create PayPal order."
      },
      { status: 500 }
    );
  }
}
