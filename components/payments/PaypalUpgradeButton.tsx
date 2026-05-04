"use client";

import { useEffect, useRef, useState } from "react";
import { loadScript } from "@paypal/paypal-js";

type PaypalUpgradeButtonProps = {
  accessToken: string;
  disabled?: boolean;
  onSuccess: () => void;
};

export function PaypalUpgradeButton({ accessToken, disabled = false, onSuccess }: PaypalUpgradeButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function mountButtons() {
      if (!accessToken || disabled) {
        return;
      }

      try {
        const paypalSdk = await loadScript({
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "",
          currency: "USD",
          intent: "capture"
        });

        if (cancelled || !paypalSdk || !containerRef.current || typeof paypalSdk.Buttons !== "function") {
          return;
        }

        containerRef.current.innerHTML = "";

        await paypalSdk
          .Buttons({
            style: {
              shape: "pill",
              height: 42,
              layout: "vertical",
              color: "gold",
              label: "paypal"
            },
            createOrder: async () => {
              setError("");
              const response = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${accessToken}`
                }
              });

              const data = (await response.json()) as { orderId?: string; error?: string };
              if (!response.ok || !data.orderId) {
                throw new Error(data.error || "Failed to create PayPal order.");
              }

              return data.orderId;
            },
            onApprove: async (details: { orderID?: string }) => {
              if (!details.orderID) {
                throw new Error("Missing approved PayPal order ID.");
              }

              const response = await fetch("/api/paypal/capture-order", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  orderId: details.orderID
                })
              });

              const data = (await response.json()) as { error?: string };
              if (!response.ok) {
                throw new Error(data.error || "Failed to unlock Pro.");
              }

              onSuccess();
            },
            onError: (paypalError: unknown) => {
              setError(paypalError instanceof Error ? paypalError.message : "PayPal checkout failed.");
            }
          })
          .render(containerRef.current);

        setReady(true);
      } catch (mountError) {
        setError(mountError instanceof Error ? mountError.message : "Failed to load PayPal.");
      }
    }

    void mountButtons();

    return () => {
      cancelled = true;
    };
  }, [accessToken, disabled, onSuccess]);

  if (!accessToken) {
    return <p className="text-xs text-black/55">Sign in first to unlock PayPal checkout.</p>;
  }

  if (disabled) {
    return <p className="text-xs text-green-700">Pro already active. SVG export is unlocked.</p>;
  }

  return (
    <div className="w-full">
      <div ref={containerRef} />
      {!ready && !error ? <p className="mt-2 text-xs text-black/55">Loading PayPal checkout…</p> : null}
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
