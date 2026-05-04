type PayPalAccessTokenResponse = {
  access_token?: string;
};

type PayPalAmount = {
  currency_code: string;
  value: string;
};

type PayPalOrder = {
  id: string;
  status?: string;
  purchase_units?: Array<{
    custom_id?: string;
    reference_id?: string;
    amount?: PayPalAmount;
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
      }>;
    };
  }>;
};

type VerifyWebhookPayload = {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
  webhookId: string;
  webhookEvent: unknown;
};

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function getPayPalApiBase() {
  return (process.env.PAYPAL_API_BASE?.trim() || "https://api-m.paypal.com").replace(/\/+$/, "");
}

export function getPayPalClientId() {
  return getRequiredEnv("NEXT_PUBLIC_PAYPAL_CLIENT_ID");
}

export function getPayPalWebhookId() {
  return getRequiredEnv("PAYPAL_WEBHOOK_ID");
}

export function getPayPalProPrice() {
  return process.env.PAYPAL_PRO_PRICE_USD?.trim() || "19.00";
}

async function paypalFetch(path: string, init: RequestInit) {
  const response = await fetch(`${getPayPalApiBase()}${path}`, init);
  return response;
}

export async function getPayPalAccessToken() {
  const clientId = getRequiredEnv("PAYPAL_CLIENT_ID");
  const clientSecret = getRequiredEnv("PAYPAL_CLIENT_SECRET");
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await paypalFetch("/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    throw new Error(`PayPal auth failed with status ${response.status}`);
  }

  const data = (await response.json()) as PayPalAccessTokenResponse;
  if (!data.access_token) {
    throw new Error("PayPal auth response did not include an access token.");
  }

  return data.access_token;
}

export async function createPayPalOrder(accessToken: string, userId: string) {
  const response = await paypalFetch("/v2/checkout/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: "scidiagram-pro",
          custom_id: userId,
          description: "SciDiagram Pro unlock",
          amount: {
            currency_code: "USD",
            value: getPayPalProPrice()
          }
        }
      ],
      application_context: {
        brand_name: "SciDiagram.io",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING"
      }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`PayPal create order failed: ${response.status} ${detail}`);
  }

  return (await response.json()) as PayPalOrder;
}

export async function capturePayPalOrder(accessToken: string, orderId: string) {
  const response = await paypalFetch(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`PayPal capture failed: ${response.status} ${detail}`);
  }

  return (await response.json()) as PayPalOrder;
}

export async function getPayPalOrder(accessToken: string, orderId: string) {
  const response = await paypalFetch(`/v2/checkout/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`PayPal order lookup failed: ${response.status} ${detail}`);
  }

  return (await response.json()) as PayPalOrder;
}

export async function verifyPayPalWebhookSignature(accessToken: string, payload: VerifyWebhookPayload) {
  const response = await paypalFetch("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      auth_algo: payload.authAlgo,
      cert_url: payload.certUrl,
      transmission_id: payload.transmissionId,
      transmission_sig: payload.transmissionSig,
      transmission_time: payload.transmissionTime,
      webhook_id: payload.webhookId,
      webhook_event: payload.webhookEvent
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`PayPal webhook verification failed: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as { verification_status?: string };
  return data.verification_status === "SUCCESS";
}
