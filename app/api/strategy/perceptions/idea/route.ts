import Anthropic from "@anthropic-ai/sdk";
import { parsePrecedent } from "@/lib/intelligence/parsePrecedent";
import { buildPrecedentSystemPrompt } from "@/lib/intelligence/precedentPrompt";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are The Right Hand. You are operating in the IDEA phase — auditing the candidate's value propositions before they are built into a manifesto.

Given the candidate's credible advantages, three promises, unique pledge, and urgency rationale, produce a Value Proposition Audit in exactly 3 sentences:

Sentence 1: Identify which of the three promises is the strongest — the one that is most credible, most specific, and most relevant to the dominant voter emotion from the DISCOVER phase. Explain why.

Sentence 2: Flag the weakest promise — the one most likely to be challenged as undeliverable or unoriginal. Tell the candidate how to either strengthen it or deprioritise it.

Sentence 3: Evaluate the unique pledge — is it genuinely unique and locally resonant, or does it risk sounding like everything else? If it is strong, say so. If it needs sharpening, give the specific edit.

Reference: Alinsky's power principle — a promise creates expectation, and expectation creates leverage. Overpromising is as strategically dangerous as underpromising.

Rules: Direct audit. Second person. No flattery. If promises are weak, the candidate needs to know before they are printed on a banner.`;

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
      credible_advantages,
      promise_1,
      promise_2,
      promise_3,
      unique_pledge,
      why_now,
      discover_context,
      define_context,
    } = await request.json();

    const advantagesList = Array.isArray(credible_advantages)
      ? credible_advantages.join("; ")
      : credible_advantages || "Not specified";

    const userMessage = `Election type: ${election_type || "constituency"}
Credible advantages: ${advantagesList}
Promise 1: ${promise_1 || "Not specified"}
Promise 2: ${promise_2 || "Not specified"}
Promise 3: ${promise_3 || "Not specified"}
Unique constituency pledge: ${unique_pledge || "Not specified"}
Why now / urgency rationale: ${why_now || "Not specified"}

DISCOVER phase context:
${discover_context || "No DISCOVER context provided."}

DEFINE phase context:
${define_context || "No DEFINE context provided."}

Produce the Value Proposition Audit now — exactly 3 sentences.`;

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
          audit: null,
          precedent: null,
          precedent_entry_id: null,
          error: "No audit generated.",
        },
        { status: 500 }
      );
    }

    const { assessment, precedent, entry_id } = parsePrecedent(raw);

    return Response.json({
      audit: assessment,
      precedent,
      precedent_entry_id: entry_id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Perceptions idea error:", message);
    return Response.json(
      {
        audit: null,
        precedent: null,
        precedent_entry_id: null,
        error: `Idea audit failed: ${message}`,
      },
      { status: 500 }
    );
  }
}
