import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `Given a campaign pledge and its most likely attack, generate a single inoculation statement — a sentence the candidate says PROACTIVELY before the opponent attacks, that acknowledges the vulnerability but reframes it as a strength.

The statement must:
- Acknowledge the concern without conceding defeat
- Reframe the vulnerability as evidence of honesty or capability
- End on the candidate's terms, not the attacker's

Example structure: "You might hear my opponent say X. Here's the reality: [reframe]."

One sentence maximum. Direct. Second person framing.`;

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

export async function POST(request: Request) {
  try {
    const { pledge, attack, defense } = await request.json();

    const userMessage = `Pledge: ${pledge || "Not specified"}
Most likely attack: ${attack || "Not specified"}
Existing defense / reframe angle: ${defense || "Not specified"}

Produce the inoculation statement now — one sentence.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const inoculation = extractText(response);

    if (!inoculation) {
      return Response.json(
        { inoculation: null, error: "No inoculation statement generated." },
        { status: 500 }
      );
    }

    return Response.json({ inoculation });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Perceptions inoculate error:", message);
    return Response.json(
      { inoculation: null, error: `Inoculation failed: ${message}` },
      { status: 500 }
    );
  }
}
