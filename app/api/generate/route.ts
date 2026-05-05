import { NextResponse } from "next/server";
import { buildMoleculeDiagramPrompt, findPresetMolecule } from "@/lib/molecules";
import { parseDiagramPayload } from "@/lib/mo-schema";

export const runtime = "edge";

export async function POST(request: Request) {
  const body = (await request.json()) as { formula?: string };
  const formula = body.formula?.trim();

  if (!formula) {
    return NextResponse.json({ error: "Formula is required." }, { status: 400 });
  }

  const preset = findPresetMolecule(formula);
  if (preset) {
    return NextResponse.json({
      diagram: preset,
      source: "database",
      note: "Served from verified database preset."
    });
  }

  const apiBaseUrl = process.env.API_BASE_URL?.trim();
  const apiKey = process.env.API_KEY?.trim();
  const apiModel = process.env.API_MODEL?.trim();

  if (!apiBaseUrl || !apiKey || !apiModel) {
    return NextResponse.json(
      {
        error: "AI generation is not configured. Set API_BASE_URL, API_KEY, and API_MODEL."
      },
      { status: 503 }
    );
  }

  const prompt = buildMoleculeDiagramPrompt(formula);
  const response = await fetch(`${apiBaseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: apiModel,
      temperature: 0.2,
      response_format: {
        type: "json_object"
      },
      messages: [
        {
          role: "system",
          content: "You output strict JSON only for molecular orbital diagram rendering."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json({ error: `AI gateway failed: ${response.status}`, detail }, { status: 502 });
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
  };

  const rawContent = payload.choices?.[0]?.message?.content;
  const content =
    typeof rawContent === "string"
      ? rawContent
      : Array.isArray(rawContent)
        ? rawContent
            .map((item) => (typeof item?.text === "string" ? item.text : ""))
            .join("")
            .trim()
        : "";

  const diagram = parseDiagramPayload(content);

  if (!diagram) {
    return NextResponse.json(
      {
        error: "AI returned invalid diagram JSON.",
        raw: content
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    diagram,
    source: "ai",
    note: "Generated via the configured model gateway. Review chemistry before publication."
  });
}
