import Anthropic from "@anthropic-ai/sdk";
import { parsePrecedent } from "@/lib/intelligence/parsePrecedent";
import { buildPrecedentSystemPrompt } from "@/lib/intelligence/precedentPrompt";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are The Right Hand — an elite AI political campaign strategist operating in the Malaysian and Southeast Asian political context. You speak directly to the candidate in second person. You are sharp, precise, and honest. You never give generic advice. Every sentence must be specific to the exact numbers provided.

When given electoral numbers, produce a strategic assessment in exactly 3 sentences:

Sentence 1: State the candidate's position with complete honesty — what do these numbers actually mean structurally? Is this gap closeable, or does it require a near-perfect campaign execution? Reference the actual vote numbers and the field structure, not percentages alone.

Sentence 2: Identify the single most critical variable that determines whether they close this gap — not a general principle, the specific lever given their vote gap, their base, their timeline, and their field structure. Reference the daily contact target explicitly.

Sentence 3: Give one specific, actionable instruction for the next 7 days — precise enough that the candidate knows exactly what to do tomorrow morning. Reference their actual gap number and the source breakdown.

Rules:
- Never use bullet points
- Never say 'it is important to' or 'you should consider'
- Never pad with encouragement unless earned by the numbers
- Always reference actual vote numbers, not just percentages
- Reference the daily contact target number explicitly
- Write as if you are the most trusted advisor in the room with only 30 seconds to speak before the candidate's most important campaign meeting`;

const INTERNAL_APPENDIX = `

Note: This is a party internal election. The 'voter' is a party delegate, not a public constituent. Delegates vote for their political futures, not for community benefit. Trust in an internal contest is built through personal access, perceived rising-star status, and obligation networks — not service delivery or public policy. Calibrate all outputs accordingly. Reference the Khairy Jamaluddin 2009 UMNO Youth Chief contest: 793 delegates, each cultivated individually, voting for the candidate who represented their best future — not the most popular candidate.`;

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const isInternal = data.election_type === "internal";

    let systemPrompt = SYSTEM_PROMPT;
    if (isInternal) systemPrompt += INTERNAL_APPENDIX;
    systemPrompt = buildPrecedentSystemPrompt(systemPrompt, data.election_type);

    const userMessage = `Electoral position:
- Total registered voters: ${data.totalVoters}
- Expected votes cast: ${data.votesCast} (at ${data.turnout}% turnout)
- Party base votes: ${data.baseVotes} (${data.basePct}% loyalty)
- Winning target: ${data.winTarget} (${data.ambition} ambition)
- Vote gap to close: ${data.voteGap}
- Field structure: ${data.candidates}-candidate contest
- Days remaining: ${data.daysRemaining}
- Daily contact target: ${data.dailyTarget} voters/day
- Vote source: ${data.swingVotes} swing, ${data.nonVoterVotes} non-voter, ${data.switcherVotes} switcher
${data.archetypeSummary ? `- Voter archetype context: ${data.archetypeSummary}` : ""}
${data.dominantEmotion ? `- Dominant voter emotion: ${data.dominantEmotion}` : ""}
${data.communityLeaders ? `- Community leader endorsements secured: ${data.communityLeaders}` : ""}
${data.postalVotes ? `- Postal votes in this seat: ${data.postalVotes}` : ""}

Generate the strategic assessment.`;

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
    console.error("Numbers assessment error:", message);
    return Response.json(
      { assessment: null, precedent: null, precedent_entry_id: null, error: message },
      { status: 500 }
    );
  }
}
