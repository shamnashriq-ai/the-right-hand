import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: Request) {
  try {
    const {
      constituency,
      seatType,
      classification,
      status,
      daysRemaining,
      topIssue,
    } = await request.json();

    if (!constituency || constituency.trim().length < 2) {
      return Response.json(
        { briefing: null, error: "Constituency name is required." },
        { status: 400 }
      );
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        },
      ],
      system: `You are The Right Hand — an elite AI political intelligence analyst. Your job is to brief a political candidate on the ground reality of their constituency using the latest available public intelligence.

You have access to web search. Use it to find:
1. Recent news and issues specific to this constituency or its surrounding area (last 6-12 months)
2. Any known political developments, controversies, infrastructure complaints, or community concerns
3. What voters in this area are saying publicly — via news coverage of public sentiment
4. Any notable social or economic issues surfacing in this constituency that the candidate should know

After searching, produce a structured Ground Intelligence Briefing with exactly these four sections:

GROUND REALITY
One paragraph. What is the factual structural situation of this constituency right now — demographic, economic, political. What kind of seat is this honestly.

LIVE ISSUES (3 items)
Three specific issues currently active in this constituency based on your search. Each issue: one bold headline + one sentence of context. These must be real and specific — not generic. If you cannot find specific issues, say so honestly and surface the closest regional issues.

UNKNOWN RISKS (2 items)
Two things the candidate may not have flagged as risks — emerging narratives, opponent positioning, or community concerns that are gaining traction. Specific and honest.

STRATEGIC IMPLICATION
One paragraph. Given this ground intelligence, what is the single most important thing this candidate must understand about their battlefield before they build their strategy.

Rules:
- Always search before answering — never fabricate
- Be specific: name places, issues, incidents
- If search returns limited results for this specific constituency, widen to the parliamentary area or state, and say so
- Never pad with generic political commentary
- Write in second person: "Your constituency..."
- Keep total response under 400 words`,
      messages: [
        {
          role: "user",
          content: `Constituency: ${constituency}
Seat type: ${seatType || "Not specified"}
Classification: ${classification || "Not specified"}
Candidate status: ${status || "Not specified"}
Days to polling: ${daysRemaining || "Not specified"}
Top issue candidate flagged: ${topIssue || "None flagged yet"}

Run web searches and produce the Ground Intelligence Briefing for this constituency now.`,
        },
      ],
    });

    // Extract the final text response (after tool use blocks)
    const textContent = response.content
      .filter((block: { type: string }) => block.type === "text")
      .map((block: { type: string; text?: string }) =>
        block.type === "text" ? (block as { type: "text"; text: string }).text : ""
      )
      .join("");

    if (!textContent) {
      return Response.json({
        briefing: null,
        error: "No briefing generated. The AI may need more search context.",
      });
    }

    return Response.json({ briefing: textContent });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Ground intelligence error:", message);
    return Response.json(
      { briefing: null, error: `Intelligence briefing failed: ${message}` },
      { status: 500 }
    );
  }
}
