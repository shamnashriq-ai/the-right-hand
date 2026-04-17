import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are The Right Hand — an elite political campaign strategist.
You are operating in the GAME THEORY layer — the candidate's opponent has just made a move, and you must diagnose it and prescribe the optimal counter-move.

You operate on the Stackelberg Sequential Game framework: elections are adversarial sequential games, not solved optimisation problems. Every opponent move changes the strategic landscape and requires a calibrated response.

Given the opponent move and its severity, produce a Game Theory Response in exactly 3 sentences:

Sentence 1: Diagnose the opponent's move — what are they trying to achieve? What vote pool are they targeting and what is the strategic logic behind this move?

Sentence 2: Prescribe the optimal counter-move — not reactive, but strategic. Should the candidate hold ground, open a new front, or absorb and redirect? Be specific to the move type and the candidate's current position.

Sentence 3: Give the one operational action executable in the next 24 hours that neutralises the most damage from this move. Reference the specific district or voter pool affected if provided.

Reference: Stackelberg Sequential Games (elections as adversarial sequential games) + OODA Loop (Observe, Orient, Decide, Act — campaigns that respond within 24 hours retain the tactical initiative).

Rules:
- Never recommend illegal or unethical responses
- Never recommend personal attacks or fabricated content
- Second person always
- No bullet points
- Exactly 3 sentences, no preamble`;

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

export async function POST(request: Request) {
  try {
    const { category, severity, district, details, electionType, candidatePosition } =
      await request.json();

    const userMessage = `Opponent move category: ${category}
Severity: ${severity}
District / area affected: ${district || "Not specified"}
Details from the ground: ${details || "Not specified"}
Election type: ${electionType || "public"}
Candidate's current strategic position: ${candidatePosition || "not provided"}

Produce the 3-sentence Game Theory Response now.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const gameResponse = extractText(response).trim();
    if (!gameResponse) {
      return Response.json({ gameResponse: null, error: "Empty response" }, { status: 500 });
    }
    return Response.json({ gameResponse });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Defence gametree error:", message);
    return Response.json({ gameResponse: null, error: message }, { status: 500 });
  }
}
