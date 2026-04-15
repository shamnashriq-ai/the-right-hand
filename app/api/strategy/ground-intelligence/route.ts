import Anthropic from "@anthropic-ai/sdk";
import { parsePrecedent } from "@/lib/intelligence/parsePrecedent";
import { buildPrecedentSystemPrompt } from "@/lib/intelligence/precedentPrompt";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are The Right Hand — an elite AI political intelligence analyst. Your job is to brief a political candidate on the ground reality of their constituency using the latest available public intelligence.

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
- Keep total response under 400 words`;

const FALLBACK_SYSTEM_PROMPT = `You are The Right Hand — an elite AI political intelligence analyst. You do NOT have access to live web search in this mode. Instead, use your training knowledge to brief a political candidate on the ground reality of their constituency.

Produce a structured Ground Intelligence Briefing with exactly these four sections:

GROUND REALITY
One paragraph. What is the factual structural situation of this constituency — demographic, economic, political. What kind of seat is this based on what you know.

LIVE ISSUES (3 items)
Three issues likely active or historically significant in this constituency or its surrounding area. Each issue: one bold headline + one sentence of context. Be honest about what is from training knowledge versus confirmed recent events. If you have no specific information, surface the most relevant regional or state-level issues and note the limitation.

UNKNOWN RISKS (2 items)
Two things the candidate may not have considered — structural risks, demographic shifts, or political dynamics that typically affect seats like this. Be specific where possible.

STRATEGIC IMPLICATION
One paragraph. Given this intelligence, what is the single most important thing this candidate must understand about their battlefield before they build their strategy.

Rules:
- Be honest that this briefing is based on training knowledge, not live search
- Add a note at the top: "[Based on training knowledge — live web search unavailable. Verify details independently.]"
- Be specific where you can: name places, known issues, historical patterns
- If you know little about a specific constituency, widen to the parliamentary area or state, and say so
- Never pad with generic political commentary
- Write in second person: "Your constituency..."
- Keep total response under 400 words`;

function buildUserMessage(
  constituency: string,
  seatType: string,
  classification: string,
  status: string,
  daysRemaining: number,
  topIssue: string
): string {
  return `Constituency: ${constituency}
Seat type: ${seatType || "Not specified"}
Classification: ${classification || "Not specified"}
Candidate status: ${status || "Not specified"}
Days to polling: ${daysRemaining || "Not specified"}
Top issue candidate flagged: ${topIssue || "None flagged yet"}

Run web searches and produce the Ground Intelligence Briefing for this constituency now.`;
}

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

export async function POST(request: Request) {
  try {
    const {
      constituency,
      seatType,
      classification,
      status,
      daysRemaining,
      topIssue,
      election_type,
    } = await request.json();

    if (!constituency || constituency.trim().length < 2) {
      return Response.json(
        { briefing: null, error: "Constituency name is required." },
        { status: 400 }
      );
    }

    const userMessage = buildUserMessage(
      constituency,
      seatType,
      classification,
      status,
      daysRemaining,
      topIssue
    );

    let textContent = "";

    const systemPrompt = buildPrecedentSystemPrompt(SYSTEM_PROMPT, election_type);
    const fallbackSystemPrompt = buildPrecedentSystemPrompt(
      FALLBACK_SYSTEM_PROMPT,
      election_type
    );

    // Attempt 1: Web search enabled
    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
          },
        ],
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });

      textContent = extractText(response);
    } catch (webSearchError: unknown) {
      const errMsg =
        webSearchError instanceof Error ? webSearchError.message : "";
      console.warn(
        "Web search unavailable, falling back to training knowledge:",
        errMsg
      );

      // Attempt 2: Fallback — regular completion without web search
      try {
        const fallbackResponse = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 1200,
          system: fallbackSystemPrompt,
          messages: [{ role: "user", content: userMessage }],
        });

        textContent = extractText(fallbackResponse);
      } catch (fallbackError: unknown) {
        const fallbackMsg =
          fallbackError instanceof Error
            ? fallbackError.message
            : "Unknown error";
        console.error("Fallback also failed:", fallbackMsg);
        return Response.json(
          {
            briefing: null,
            error: `Intelligence briefing failed: ${fallbackMsg}`,
          },
          { status: 500 }
        );
      }
    }

    if (!textContent) {
      return Response.json({
        briefing: null,
        precedent: null,
        precedent_entry_id: null,
        error: "No briefing generated. The AI may need more search context.",
      });
    }

    const { assessment, precedent, entry_id } = parsePrecedent(textContent);

    return Response.json({
      briefing: assessment,
      precedent,
      precedent_entry_id: entry_id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Ground intelligence error:", message);
    return Response.json(
      {
        briefing: null,
        precedent: null,
        precedent_entry_id: null,
        error: `Intelligence briefing failed: ${message}`,
      },
      { status: 500 }
    );
  }
}
