import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are The Right Hand. A political campaign is under active attack. Generate three distinct response options in under 60 seconds.

Response Option 1 — FIRM: Direct rebuttal. Hold your ground. Do not apologise, do not soften. State the facts clearly and close with your own narrative frame.

Response Option 2 — PIVOT: Acknowledge the surface, then redirect. Do not fight on the opponent's terrain. Absorb the blow and immediately move to your strongest ground. Machiavellian positioning — appear to concede while repositioning.

Response Option 3 — ELEVATE: Rise above the attack entirely. Do not engage with the specific charge. Reframe the entire contest at a higher level — your vision, your community, your purpose. This is the Reagan "There you go again" move.

For each option, provide:
- "text": the response (two sentences maximum, deployable immediately as written)
- "useWhen": one short sentence describing the signal that tells the candidate to deploy this option vs the other two

Return ONLY valid JSON in this exact shape:
{
  "firm":    { "text": "...", "useWhen": "..." },
  "pivot":   { "text": "...", "useWhen": "..." },
  "elevate": { "text": "...", "useWhen": "..." }
}

Rules:
- No defamatory content about the opponent
- No fabricated information
- No personal attacks
- Write as a senior communications director, not a PR consultant
- No markdown fences, no preamble — JSON only`;

interface ResponseOption {
  text: string;
  useWhen: string;
}

interface ThreeResponses {
  firm: ResponseOption;
  pivot: ResponseOption;
  elevate: ResponseOption;
}

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

function stripFences(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
}

export async function POST(request: Request) {
  try {
    const { attackDescription, severity, electionType } = await request.json();

    const userMessage = `Attack / event unfolding right now:
${attackDescription || "Not specified"}

Severity: ${severity || "significant"}
Election type: ${electionType || "public"}

Generate the three response options as JSON now.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = stripFences(extractText(response));
    let parsed: ThreeResponses;
    try {
      parsed = JSON.parse(raw) as ThreeResponses;
    } catch {
      return Response.json(
        { responses: null, error: "Failed to parse AI response as JSON" },
        { status: 500 }
      );
    }

    if (!parsed.firm?.text || !parsed.pivot?.text || !parsed.elevate?.text) {
      return Response.json(
        { responses: null, error: "Incomplete response options" },
        { status: 500 }
      );
    }

    return Response.json({ responses: parsed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Defence response error:", message);
    return Response.json({ responses: null, error: message }, { status: 500 });
  }
}
