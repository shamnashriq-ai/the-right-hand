import Anthropic from "@anthropic-ai/sdk";
import { parsePrecedent } from "@/lib/intelligence/parsePrecedent";
import { buildPrecedentSystemPrompt } from "@/lib/intelligence/precedentPrompt";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are The Right Hand. You are operating in the DEFINE phase — positioning the candidate relative to their voter's emotional needs (from DISCOVER) and relative to their opponent.

Given the candidate identity, contrast with opponent, positioning statement, and vulnerability, produce a Political Positioning Brief in exactly 3 sentences:

Sentence 1: Validate or challenge the positioning statement — does it occupy genuinely distinct territory, or does it risk sounding like every other candidate? Be direct.

Sentence 2: Identify the positioning risk — the one way this narrative framing could be turned against the candidate if the opponent is smart. Forewarn before the campaign starts.

Sentence 3: Give the single most important word or phrase this candidate should own in this campaign — the word that, if repeated consistently across every medium, will define their political identity in this constituency. Explain why that word is theirs to claim.

Reference: Edelman's symbolic politics — the candidate who controls the dominant symbol of the campaign controls its emotional outcome. Machiavelli's appearance management — what voters see must be calibrated to what they need to believe.

Rules: Direct. Second person. No bullet points. If the positioning is weak, say so. Better to know before the campaign launches.`;

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

export async function POST(request: Request) {
  try {
    const {
      election_type,
      candidate_identity,
      contrast,
      positioning_statement,
      one_thing,
      vulnerability,
      vulnerability_counter,
      discover_context,
    } = await request.json();

    const userMessage = `Election type: ${election_type || "constituency"}
Candidate identity: ${candidate_identity || "Not specified"}
Contrast with opponent: ${contrast || "Not specified"}
Positioning statement: ${positioning_statement || "Not specified"}
The one thing voters must remember: ${one_thing || "Not specified"}
Candidate vulnerability: ${vulnerability || "Not specified"}
Vulnerability counter: ${vulnerability_counter || "Not specified"}

DISCOVER phase context:
${discover_context || "No DISCOVER context provided."}

Produce the Political Positioning Brief now — exactly 3 sentences.`;

    const systemPrompt = buildPrecedentSystemPrompt(SYSTEM_PROMPT, election_type);

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = extractText(response);

    if (!raw) {
      return Response.json(
        {
          brief: null,
          precedent: null,
          precedent_entry_id: null,
          error: "No brief generated.",
        },
        { status: 500 }
      );
    }

    const { assessment, precedent, entry_id } = parsePrecedent(raw);

    return Response.json({
      brief: assessment,
      precedent,
      precedent_entry_id: entry_id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Perceptions define error:", message);
    return Response.json(
      {
        brief: null,
        precedent: null,
        precedent_entry_id: null,
        error: `Define brief failed: ${message}`,
      },
      { status: 500 }
    );
  }
}
