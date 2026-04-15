import Anthropic from "@anthropic-ai/sdk";
import { parsePrecedent } from "@/lib/intelligence/parsePrecedent";
import {
  PRECEDENT_PROMPT_APPENDIX,
  PRECEDENT_INTERNAL_APPENDIX,
} from "@/lib/intelligence/precedentPrompt";

const client = new Anthropic();

const BASE_SYSTEM_PROMPT = `You are The Right Hand — an elite political brand strategist. You are operating in the DISCOVER phase of the brand narrative framework — the phase where you understand the voter before building the candidate's story.

Given the voter emotion, problem statements, blame attribution, and what voters want most, produce a Voter Problem Synthesis in exactly 3 sentences:

Sentence 1: Name the single core emotional tension this voter base is carrying — the gap between what they were promised and what they are experiencing. Ground this in the specific problem statements given.

Sentence 2: Identify the trust threshold — what would need to be true about a candidate for this voter to believe them? This is not a policy position — it is an emotional credibility standard.

Sentence 3: Name the narrative danger zone — the framing or behaviour that would immediately destroy trust with this voter base, even if the candidate has good intentions.

Reference: Murray Edelman's symbolic politics framework — voters respond to symbols, rituals, and emotional cues before they evaluate policy content. The candidate who enters the right emotional register first wins the perception battle.

Rules: Second person always. Specific to inputs. No bullet points. No generic advice. Write as if the candidate has 60 seconds before their first ceramah and needs to know exactly what emotional key to strike.`;

const INTERNAL_APPENDIX = `

Note: This is a party internal election. The "voters" are delegates. Frame problem statements as internal party issues and trust thresholds in delegate terms.`;

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
      dominant_emotion,
      problem_1,
      problem_2,
      problem_3,
      who_they_blame,
      what_they_want_most,
      current_perception,
    } = await request.json();

    let systemPrompt =
      election_type === "internal"
        ? BASE_SYSTEM_PROMPT + INTERNAL_APPENDIX
        : BASE_SYSTEM_PROMPT;
    systemPrompt += PRECEDENT_PROMPT_APPENDIX;
    if (election_type === "internal") {
      systemPrompt += PRECEDENT_INTERNAL_APPENDIX;
    }

    const userMessage = `Election type: ${election_type || "constituency"}
Dominant voter emotion: ${dominant_emotion || "Not specified"}
Problem statement 1: ${problem_1 || "Not specified"}
Problem statement 2: ${problem_2 || "Not specified"}
Problem statement 3: ${problem_3 || "Not specified"}
Who voters blame: ${who_they_blame || "Not specified"}
What voters want most: ${what_they_want_most || "Not specified"}
Current perception of candidate: ${current_perception || "Not specified"}

Produce the Voter Problem Synthesis now — exactly 3 sentences.`;

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
          insight: null,
          precedent: null,
          precedent_entry_id: null,
          error: "No synthesis generated.",
        },
        { status: 500 }
      );
    }

    const { assessment, precedent, entry_id } = parsePrecedent(raw);

    return Response.json({
      insight: assessment,
      precedent,
      precedent_entry_id: entry_id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Perceptions discover error:", message);
    return Response.json(
      {
        insight: null,
        precedent: null,
        precedent_entry_id: null,
        error: `Discover synthesis failed: ${message}`,
      },
      { status: 500 }
    );
  }
}
