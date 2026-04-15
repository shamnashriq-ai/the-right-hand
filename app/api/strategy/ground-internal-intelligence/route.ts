import Anthropic from "@anthropic-ai/sdk";
import { parsePrecedent } from "@/lib/intelligence/parsePrecedent";
import { buildPrecedentSystemPrompt } from "@/lib/intelligence/precedentPrompt";

const client = new Anthropic();

// Internal-contest routes always treat election_type as "internal" for precedent selection.
const INTERNAL_ELECTION_TYPE = "internal";

const SYSTEM_PROMPT = `You are The Right Hand — an elite AI political intelligence analyst specialising in party internal elections. Your job is to brief a candidate contesting a party internal position on the power dynamics, faction landscape, and internal politics of their party.

You have access to web search. Use it to find:
1. Recent news about this party's internal elections, leadership contests, or faction dynamics (last 6-12 months)
2. Any known power struggles, leadership changes, disciplinary actions, or membership controversies
3. Who the key power brokers, faction leaders, or kingmakers are in this party
4. Any delegate-related news — membership drives, delegate selection controversies, or branch-level disputes

After searching, produce a structured Internal Intelligence Briefing with exactly these four sections:

POWER STRUCTURE
One paragraph. Who controls this party right now? What are the major factions? How does power flow from the top to the division/branch level? What is the current leadership dynamic honestly.

DELEGATE DYNAMICS (3 items)
Three specific dynamics currently active in this party's internal politics based on your search. Each item: one bold headline + one sentence of context. These must be real and specific — not generic. If you cannot find specific items, say so honestly and surface the closest relevant party-level dynamics.

HIDDEN RISKS (2 items)
Two things the candidate may not have considered — backroom deals, faction realignments, membership roll manipulation risks, or patronage shifts that could affect their contest. Specific and honest.

STRATEGIC IMPLICATION
One paragraph. Given this internal intelligence, what is the single most important thing this candidate must understand about their party's power dynamics before they build their delegate strategy.

Rules:
- Always search before answering — never fabricate
- Be specific: name factions, leaders, incidents where possible
- If search returns limited results for this specific party position, widen to the party's national dynamics, and say so
- Never pad with generic political commentary
- Write in second person: "Your party..."
- Keep total response under 400 words`;

const FALLBACK_SYSTEM_PROMPT = `You are The Right Hand — an elite AI political intelligence analyst specialising in party internal elections. You do NOT have access to live web search in this mode. Instead, use your training knowledge to brief a candidate on the internal politics of their party.

Produce a structured Internal Intelligence Briefing with exactly these four sections:

POWER STRUCTURE
One paragraph. Who controls this party? What are the major factions? How does power flow internally? What is the leadership dynamic based on what you know.

DELEGATE DYNAMICS (3 items)
Three dynamics likely relevant to this party's internal elections. Each item: one bold headline + one sentence of context. Be honest about what is from training knowledge versus confirmed recent events.

HIDDEN RISKS (2 items)
Two things the candidate may not have considered — structural risks in party elections, common manipulation tactics, or power dynamics that typically affect contests like this.

STRATEGIC IMPLICATION
One paragraph. Given this intelligence, what is the single most important thing this candidate must understand about their party's internal dynamics.

Rules:
- Be honest that this briefing is based on training knowledge, not live search
- Add a note at the top: "[Based on training knowledge — live web search unavailable. Verify details independently.]"
- Be specific where you can: name factions, known leaders, historical patterns
- Never pad with generic commentary
- Write in second person: "Your party..."
- Keep total response under 400 words`;

function buildUserMessage(
  partyName: string,
  positionContested: string,
  electionLevel: string,
  incumbentStatus: string,
  daysRemaining: number
): string {
  return `Party: ${partyName}
Position contested: ${positionContested}
Election level: ${electionLevel || "Not specified"}
Candidate status: ${incumbentStatus || "Not specified"}
Days to election: ${daysRemaining || "Not specified"}

Run web searches and produce the Internal Intelligence Briefing for this party contest now.`;
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
      partyName,
      positionContested,
      electionLevel,
      incumbentStatus,
      daysRemaining,
    } = await request.json();

    if (!partyName || partyName.trim().length < 2) {
      return Response.json(
        { briefing: null, error: "Party name is required." },
        { status: 400 }
      );
    }

    const userMessage = buildUserMessage(
      partyName,
      positionContested,
      electionLevel,
      incumbentStatus,
      daysRemaining
    );

    let textContent = "";

    const systemPrompt = buildPrecedentSystemPrompt(
      SYSTEM_PROMPT,
      INTERNAL_ELECTION_TYPE
    );
    const fallbackSystemPrompt = buildPrecedentSystemPrompt(
      FALLBACK_SYSTEM_PROMPT,
      INTERNAL_ELECTION_TYPE
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
    console.error("Internal intelligence error:", message);
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
