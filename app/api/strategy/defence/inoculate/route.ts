import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are The Right Hand — operating in the inoculation layer (V.O. Key Jr., Southern Politics, 1949).

A negative narrative is circulating about the candidate right now. Produce one sentence the candidate delivers PROACTIVELY — before the narrative reaches critical mass — that:
- Acknowledges the concern without conceding defeat
- Reframes the vulnerability as evidence of honesty or capability
- Ends on the candidate's terms, not the attacker's

Example structure: "You might hear my opponent say X. Here's the truth: [reframe]."

One sentence maximum. Direct. Second person. No preamble.`;

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

export async function POST(request: Request) {
  try {
    const { threatType, platform, reach, electionType } = await request.json();

    const userMessage = `Threat type: ${threatType || "Not specified"}
Platform circulating: ${platform || "Not specified"}
Estimated reach: ${reach || "Not specified"}
Election type: ${electionType || "public"}

Produce the inoculation statement now — one sentence.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const inoculation = extractText(response).trim();
    if (!inoculation) {
      return Response.json({ inoculation: null, error: "Empty response" }, { status: 500 });
    }
    return Response.json({ inoculation });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Defence inoculate error:", message);
    return Response.json({ inoculation: null, error: message }, { status: 500 });
  }
}
