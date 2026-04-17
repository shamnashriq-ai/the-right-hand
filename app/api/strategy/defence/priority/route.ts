import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are The Right Hand — reviewing a live campaign's five daily health metrics.

One or more of these metrics has fallen below threshold. Produce one sentence that names the single most urgent corrective action across all five metrics. Do not list multiple actions. Do not explain. Prescribe the one thing that, if done in the next 24 hours, most increases the probability of closing the gap by polling day.

Second person. One sentence. Begin with an action verb. No preamble.`;

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

export async function POST(request: Request) {
  try {
    const {
      numbersTrajectory,
      mobilisationVelocity,
      perceptionMomentum,
      daysToGap,
      strategyAdherence,
      daysRemaining,
      electionType,
    } = await request.json();

    const userMessage = `Campaign scorecard snapshot:

1. Numbers Trajectory: ${numbersTrajectory || "unknown"}
2. Mobilisation Velocity: ${mobilisationVelocity || "unknown"}
3. Perception Momentum: ${perceptionMomentum || "unknown"}
4. Days-to-Gap Ratio: ${daysToGap || "unknown"}
5. Strategy Adherence: ${strategyAdherence || "unknown"}

Days to polling day: ${daysRemaining}
Election type: ${electionType || "public"}

Produce the one-sentence PRIORITY ACTION now.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 250,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const action = extractText(response).trim();
    if (!action) {
      return Response.json({ action: null, error: "Empty response" }, { status: 500 });
    }
    return Response.json({ action });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Defence priority error:", message);
    return Response.json({ action: null, error: message }, { status: 500 });
  }
}
