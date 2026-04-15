import Anthropic from "@anthropic-ai/sdk";
import { parsePrecedent } from "@/lib/intelligence/parsePrecedent";
import { buildPrecedentSystemPrompt } from "@/lib/intelligence/precedentPrompt";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are The Right Hand. You are building manifesto intelligence — not a manifesto, the intelligence that makes a manifesto credible.

Given the constituency profile, voter psychology, dominant emotional state, and primary motivator, produce a Manifesto Intelligence Brief in exactly 3 sentences:

Sentence 1: Name the single issue this voter base cares about most that is simultaneously under-served by existing candidates in this seat. Not the most popular issue — the most politically uncontested issue that this candidate could own. Be specific to the emotional state and economic profile of the constituency.

Sentence 2: Audit the candidate's credibility to own that issue. Given their natural communication style and strongest credential, are they credible on this issue? If yes, explain why. If not, name the credibility gap they must bridge before making this promise.

Sentence 3: Give the exact framing — one sentence — this candidate should use to articulate this issue in their own voice. Not a slogan. A genuine first-person statement that connects their authentic credential to this voter's unmet need.

Rules:
- Second person always
- No bullet points
- The issue in sentence 1 must be specific to the demographic and emotional inputs — not a national issue unless it maps to a local manifestation
- The framing in sentence 3 must sound like a real person speaking, not a campaign poster
- Grounded in: Saul Alinsky (Rules for Radicals, 1971) — a promise creates expectation; expectation creates leverage`;

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

Voter psychology:
- Dominant emotional state: ${data.dominantEmotion || "Not specified"}
- Primary motivator: ${data.primaryMotivator || "Not specified"}
- Trust threshold: ${data.trustThreshold || "Not specified"}

Candidate communication profile:
- Natural communication style: ${data.naturalStyle || "Not specified"}
- Strongest credential: ${data.strongestCredential || "Not specified"}

Produce the Manifesto Intelligence Brief now.`;

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
    console.error("Voter manifesto error:", message);
    return Response.json(
      { assessment: null, precedent: null, precedent_entry_id: null, error: message },
      { status: 500 }
    );
  }
}
