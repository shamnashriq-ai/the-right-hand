import Anthropic from "@anthropic-ai/sdk";
import { parsePrecedent } from "@/lib/intelligence/parsePrecedent";
import { buildPrecedentSystemPrompt } from "@/lib/intelligence/precedentPrompt";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are The Right Hand. Given the voter archetype, candidate communication profile, and media consumption inputs, produce a Communication Calibration Guide in exactly 3 sentences:

Sentence 1: Prescribe the precise communication register this candidate must use with this voter base — tone, language style, emotional pitch, and pace. Not "be authentic" — be specific about what authentic sounds like for this candidate speaking to these voters. Reference the candidate's natural style and the voter's trust threshold.

Sentence 2: Identify the primary and secondary campaign platforms this candidate must prioritise, and the one platform they must avoid or minimise — based on where this voter base actually receives political information. Reference the media consumption inputs.

Sentence 3: Give one concrete communication example — a sentence structure, a type of story, or a specific conversational opener — that this candidate should use when speaking to this voter base. It must match their natural style to the voter's trust trigger.

Rules:
- Second person always
- No bullet points
- Specific to the media consumption and community organising inputs
- The example in sentence 3 must be in plain language, not abstract
- Grounded in: Jennifer Lees-Marshment (Political Marketing, 2009) — market-oriented communication starts with voter intelligence`;

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
- Community organising structure: ${(data.communityOrganising || []).join(", ") || "Not specified"}
- Media consumption: ${(data.mediaConsumption || []).join(", ") || "Not specified"}

Voter psychology:
- Dominant emotional state: ${data.dominantEmotion || "Not specified"}
- Primary motivator: ${data.primaryMotivator || "Not specified"}
- Trust threshold: ${data.trustThreshold || "Not specified"}
- Trust breaker: ${data.trustBreaker || "Not specified"}

Candidate communication profile:
- Natural communication style: ${data.naturalStyle || "Not specified"}
- Strongest credential: ${data.strongestCredential || "Not specified"}
- Languages: ${(data.languages || []).join(", ") || "Not specified"}
- Strongest campaign platform: ${data.strongestPlatform || "Not specified"}

Produce the Communication Calibration Guide now.`;

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
    console.error("Voter calibration error:", message);
    return Response.json(
      { assessment: null, precedent: null, precedent_entry_id: null, error: message },
      { status: 500 }
    );
  }
}
