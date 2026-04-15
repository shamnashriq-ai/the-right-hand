import Anthropic from "@anthropic-ai/sdk";
import { parsePrecedent } from "@/lib/intelligence/parsePrecedent";
import { buildPrecedentSystemPrompt } from "@/lib/intelligence/precedentPrompt";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are The Right Hand — an elite AI political campaign strategist operating in the Malaysian political context. You are building a voter intelligence profile, not a demographic summary.

Given the constituency profile, voter psychology inputs, and dominant emotional state provided, produce a Voter Archetype Profile in exactly 3 sentences:

Sentence 1: Name and describe the dominant voter archetype in this constituency — not a demographic category, a psychological portrait. Who are these people at their core? What do they carry into the polling booth? Reference the dominant emotion and primary motivator from the inputs.

Sentence 2: Identify the single trust trigger that unlocks this voter base — the one signal, if credibly sent, that converts scepticism into support. Be specific to the inputs. Not a generic trust principle — the specific action or signal that works for this specific archetype.

Sentence 3: Name the single trust breaker that immediately disqualifies a candidate with this voter base — the behaviour or perception that, once formed, is nearly impossible to recover from.

Rules:
- Speak directly to the candidate in second person ("Your voters...", "This constituency...")
- Never use bullet points
- Reference the specific ethnic, religious, generational, and economic inputs — not generic Malaysian voter behaviour
- Write as if you are briefing the candidate before their first ceramah in this constituency
- Grounded in: Murray Edelman (Symbolic Uses of Politics, 1964) — voters respond to symbols and emotional registers before policy`;

const INTERNAL_APPENDIX = `

Note: This is a party internal election. The 'voter' is a party delegate, not a public constituent. Delegates vote for their political futures, not for community benefit. Trust in an internal contest is built through personal access, perceived rising-star status, and obligation networks — not service delivery or public policy. Calibrate all outputs accordingly. Reference the Khairy Jamaluddin 2009 UMNO Youth Chief contest: 793 delegates, each cultivated individually, voting for the candidate who represented their best future — not the most popular candidate.`;

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const isInternal = data.election_type === "internal";

    let systemPrompt = SYSTEM_PROMPT;
    if (isInternal) systemPrompt += INTERNAL_APPENDIX;
    systemPrompt = buildPrecedentSystemPrompt(systemPrompt, data.election_type);

    const userMessage = `Constituency demographics:
- Dominant ethnic composition: ${data.ethnicComposition || "Not specified"}
- Dominant age segment: ${data.ageSegment || "Not specified"}
- Socioeconomic profile: ${data.socioeconomicProfile || "Not specified"}
- Religious identity: ${data.religiousIdentity || "Not specified"}
- Community organising structure: ${(data.communityOrganising || []).join(", ") || "Not specified"}
- Media consumption: ${(data.mediaConsumption || []).join(", ") || "Not specified"}

Voter psychology:
- Dominant emotional state: ${data.dominantEmotion || "Not specified"}
- Primary motivator: ${data.primaryMotivator || "Not specified"}
- Trust threshold: ${data.trustThreshold || "Not specified"}
- Trust breaker: ${data.trustBreaker || "Not specified"}

Produce the Voter Archetype Profile now.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    const { assessment, precedent, entry_id } = parsePrecedent(textContent);

    return Response.json({
      assessment,
      precedent,
      precedent_entry_id: entry_id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Voter archetype error:", message);
    return Response.json(
      { assessment: null, precedent: null, precedent_entry_id: null, error: message },
      { status: 500 }
    );
  }
}
