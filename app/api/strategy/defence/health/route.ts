import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are The Right Hand — an elite political campaign strategist reviewing a live campaign's health. Produce one honest, calibrated sentence that describes the overall strategic position of this campaign right now.

Do not be motivational. Do not be catastrophic. State the real picture in one sentence a senior strategist would say in a closed-door briefing. Reference the most load-bearing signal (strongest advantage or most urgent weakness).

Second person. One sentence. No preamble.`;

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

export async function POST(request: Request) {
  try {
    const {
      candidateName,
      constituency,
      daysRemaining,
      compositeHealth,
      scores,
      electionType,
    } = await request.json();

    const userMessage = `Candidate: ${candidateName || "Unnamed"}
Constituency: ${constituency || "Unspecified"}
Election type: ${electionType || "public"}
Days to polling day: ${daysRemaining}
Composite campaign health: ${compositeHealth}/100

Axis scores (0-100):
- Ground: ${scores?.ground}
- Numbers: ${scores?.numbers}
- Narrative: ${scores?.narrative}
- Organisation: ${scores?.organisation}
- Momentum: ${scores?.momentum}
- Resources: ${scores?.resources}

Produce the Strategic Assessment in one sentence.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const assessment = extractText(response).trim();
    if (!assessment) {
      return Response.json({ assessment: null, error: "Empty response" }, { status: 500 });
    }
    return Response.json({ assessment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Defence health error:", message);
    return Response.json({ assessment: null, error: message }, { status: 500 });
  }
}
