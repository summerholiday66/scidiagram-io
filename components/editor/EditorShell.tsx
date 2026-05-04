"use client";

import { useEffect, useState } from "react";
import { Download, LogIn, Sparkles } from "lucide-react";
import { DiagramCanvas } from "@/components/mo-diagram/DiagramCanvas";
import { PaypalUpgradeButton } from "@/components/payments/PaypalUpgradeButton";
import { SignInButton } from "@/components/auth/SignInButton";
import { sampleMoleculeOptions } from "@/lib/molecules";
import { getBrowserAccessToken, getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { MODiagram } from "@/types/mo-diagram";

type EditorShellProps = {
  initialDiagram: MODiagram;
};

export function EditorShell({ initialDiagram }: EditorShellProps) {
  const [formula, setFormula] = useState(initialDiagram.formula);
  const [diagram, setDiagram] = useState<MODiagram>(initialDiagram);
  const [status, setStatus] = useState<"database" | "ai">("database");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingSvg, setIsDownloadingSvg] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      return;
    }
    const supabase = client;

    async function syncSession() {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      setAccessToken(session?.access_token ?? "");
      setUserEmail(session?.user?.email ?? "");
    }

    void syncSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? "");
      setUserEmail(session?.user?.email ?? "");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function syncProStatus() {
      if (!accessToken) {
        setIsPro(false);
        return;
      }

      try {
        const response = await fetch("/api/account/status", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          setIsPro(false);
          return;
        }

        const data = (await response.json()) as { isPro?: boolean };
        setIsPro(data.isPro === true);
      } catch {
        setIsPro(false);
      }
    }

    void syncProStatus();
  }, [accessToken]);

  function handleUsePreset(nextFormula: string) {
    const preset = sampleMoleculeOptions.find((item) => item.formula === nextFormula);

    if (!preset) {
      return;
    }

    setFormula(preset.formula);
    setDiagram(preset.diagram);
    setStatus(preset.source);
    setMessage("");
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setMessage("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          formula
        })
      });

      const data = (await response.json()) as {
        diagram?: MODiagram;
        source?: "database" | "ai";
        note?: string;
        error?: string;
      };

      if (!response.ok || !data.diagram || !data.source) {
        throw new Error(data.error || "Failed to generate the diagram.");
      }

      setDiagram(data.diagram);
      setStatus(data.source);
      setFormula(data.diagram.formula);
      setMessage(data.note || "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to generate the diagram.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDownloadPng() {
    const svgElement = document.querySelector("svg[aria-label]") as SVGSVGElement | null;
    if (!svgElement) {
      setMessage("Diagram SVG is not ready.");
      return;
    }

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1720;
      canvas.height = 680;
      const context = canvas.getContext("2d");

      if (!context) {
        setMessage("Canvas export is not available in this browser.");
        URL.revokeObjectURL(url);
        return;
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(17, 17, 17, 0.16)";
      context.font = "700 42px Arial";
      context.textAlign = "center";
      context.fillText("SciDiagram.io FREE PREVIEW", canvas.width / 2, canvas.height - 44);

      const href = canvas.toDataURL("image/png");
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `${diagram.formula.toLowerCase()}-mo-diagram-preview.png`;
      anchor.click();
      URL.revokeObjectURL(url);
    };

    image.src = url;
  }

  async function handleDownloadSvg() {
    setIsDownloadingSvg(true);
    setMessage("");

    try {
      const latestToken = await getBrowserAccessToken();
      if (!latestToken) {
        throw new Error("Please sign in before downloading SVG.");
      }

      const response = await fetch("/api/export/svg", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${latestToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          diagram
        })
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to export SVG.");
      }

      const svgText = await response.text();
      const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${diagram.formula.toLowerCase()}-mo-diagram.svg`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("HD SVG downloaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to export SVG.");
    } finally {
      setIsDownloadingSvg(false);
    }
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-5 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-black/10 bg-white/88 p-5 shadow-panel">
          <div className="border-b border-black/6 pb-4">
            <p className="text-xs uppercase tracking-[0.22em] text-black/40">SciDiagram.io</p>
            <h1 className="mt-2 text-lg font-semibold">MO editor</h1>
            <p className="mt-2 text-sm leading-6 text-black/62">
              Database-first generation for common diatomic molecules. Experimental AI mode can extend to simpler
              multi-atom cases later.
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-black/40">Molecule</span>
              <input
                value={formula}
                onChange={(event) => setFormula(event.target.value)}
                placeholder="Enter O2, CO, HF"
                className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-accent"
              />
            </label>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-black/40">Presets</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sampleMoleculeOptions.map((item) => (
                  <button
                    key={item.formula}
                    type="button"
                    onClick={() => handleUsePreset(item.formula)}
                    className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium transition hover:border-accent"
                  >
                    {item.formula}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                void handleGenerate();
              }}
              disabled={isGenerating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate diagram"}
            </button>

            <div className="rounded-[20px] border border-black/8 bg-mist p-4 text-sm leading-6 text-black/65">
              <p className="font-medium text-black">Current source</p>
              <p className="mt-1">
                {status === "database" ? "Verified preset model" : "AI generated model with review tag"}
              </p>
              {message ? <p className="mt-2 text-xs text-black/55">{message}</p> : null}
            </div>
          </div>

          <div className="mt-5 space-y-3 border-t border-black/6 pt-5">
            <div className="flex items-center justify-between rounded-2xl border border-black/8 bg-[#fbfaf7] px-4 py-3">
              <div>
                <p className="text-sm font-medium">Sign in</p>
                <p className="text-xs text-black/55">{userEmail || "Google OAuth via Supabase"}</p>
              </div>
              <SignInButton>
                <LogIn className="h-4 w-4" />
              </SignInButton>
            </div>

            <div className="rounded-2xl border border-black/8 bg-[#fbfaf7] p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Upgrade exports</p>
                  <p className="text-xs text-black/55">PayPal payment unlocks clean SVG export and syncs `is_pro` in Supabase.</p>
                </div>
                <PaypalUpgradeButton
                  accessToken={accessToken}
                  disabled={isPro}
                  onSuccess={() => {
                    setIsPro(true);
                    setMessage("Payment confirmed. Pro export unlocked.");
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                void handleDownloadPng();
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              Download watermark PNG
            </button>

            <button
              type="button"
              onClick={() => {
                void handleDownloadSvg();
              }}
              disabled={!isPro || isDownloadingSvg}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#155eef] px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-[#9dbaf9]"
            >
              <Download className="h-4 w-4" />
              {isDownloadingSvg ? "Preparing SVG..." : isPro ? "Download HD SVG" : "HD SVG requires Pro"}
            </button>
          </div>
        </aside>

        <section className="rounded-[30px] border border-black/10 bg-white/92 p-5 shadow-panel">
          <DiagramCanvas diagram={diagram} />
        </section>
      </div>
    </main>
  );
}
