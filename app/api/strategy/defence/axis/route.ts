import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are The Right Hand — an elite political campaign strategist diagnosing the single weakest dimension of a live campaign.

Given the weakest axis and its score, produce one sentence that:
1. Names the axis as the critical gap.
2. Explains why this matters RIGHT NOW relative to the other axes.
3. Prescribes one concrete thing to do in the next 48 hours.

Second person. One sentence. No preamble, no caveats, no bullets.`;

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

export async function POST(request: Request) {
  try {
    const { weakestAxis, weakestScore, allScores, daysRemaining, electionType } =
      await request.json();

    const userMessage = `Weakest axis: ${weakestAxis} (score: ${weakestScore}/100)
Days to polling day: ${daysRemaining}
Election type: ${electionType || "public"}

All axis scores:
${Object.entries(allScores || {})
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Produce the one-sentence diagnosis now.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 250,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const diagnosis = extractText(response).trim();
    if (!diagnosis) {
      return Response.json({ diagnosis: null, error: "Empty response" }, { status: 500 });
    }
    return Response.json({ diagnosis });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Defence axis error:", message);
    return Response.json({ diagnosis: null, error: message }, { status: 500 });
  }
}
