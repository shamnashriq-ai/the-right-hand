import Anthropic from "@anthropic-ai/sdk";
import { parsePrecedent } from "@/lib/intelligence/parsePrecedent";
import { buildPrecedentSystemPrompt } from "@/lib/intelligence/precedentPrompt";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are The Right Hand. The candidate has completed all five phases of the Brand Narrative Framework:
- DISCOVER: Voter problem statements and emotional state
- DEFINE: Positioning statement and differentiator
- IDEA: Three promises and unique constituency pledge
- DEVELOP: Full manifesto generated
- MEASURE: Defense claims and inoculation statements prepared

Produce a complete Narrative Intelligence Assessment in exactly 3 sentences:

Sentence 1: Assess the overall strategic coherence of the narrative — does the manifesto authentically connect the voter's problem (DISCOVER) to the candidate's unique position (DEFINE) to their credible promises (IDEA)? Is the thread continuous from voter problem to candidate solution?

Sentence 2: Identify the single most dangerous gap in the narrative — the place where a smart opponent could insert doubt, attack credibility, or exploit a contradiction between what was promised and what is credibly deliverable.

Sentence 3: Give the one narrative action that would most strengthen the overall brand position before the campaign launches — not a tactic, a strategic repositioning move that closes the most critical gap.

Reference:
- Edelman: The candidate who controls the dominant symbol wins.
- Machiavelli: Appearance must be managed as rigorously as substance.
- Lasswell: Symbol management precedes and shapes all political reality.

Rules: Second person. Specific to these inputs. No generic narrative advice. Write as if this is the final briefing before the campaign launches publicly tomorrow.`;

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      election_type,
      // DISCOVER
      dominant_emotion,
      problem_1,
      problem_2,
      problem_3,
      who_they_blame,
      what_they_want_most,
      current_perception,
      discover_insight,
      // DEFINE
      candidate_identity,
      contrast,
      positioning_statement,
      one_thing,
      vulnerability,
      vulnerability_counter,
      define_brief,
      // IDEA
      credible_advantages,
      promise_1,
      promise_2,
      promise_3,
      unique_pledge,
      why_now,
      idea_audit,
      // DEVELOP
      manifesto,
      // MEASURE
      defense_claims,
      inoculations,
    } = body;

    const advantagesList = Array.isArray(credible_advantages)
      ? credible_advantages.join("; ")
      : credible_advantages || "Not specified";

    const userMessage = `Election type: ${election_type || "constituency"}

=== DISCOVER ===
Dominant voter emotion: ${dominant_emotion || "Not specified"}
Problem 1: ${problem_1 || "Not specified"}
Problem 2: ${problem_2 || "Not specified"}
Problem 3: ${problem_3 || "Not specified"}
Who voters blame: ${who_they_blame || "Not specified"}
What voters want most: ${what_they_want_most || "Not specified"}
Current perception: ${current_perception || "Not specified"}
Discover synthesis: ${discover_insight || "Not generated"}

=== DEFINE ===
Candidate identity: ${candidate_identity || "Not specified"}
Contrast with opponent: ${contrast || "Not specified"}
Positioning statement: ${positioning_statement || "Not specified"}
One thing to remember: ${one_thing || "Not specified"}
Vulnerability: ${vulnerability || "Not specified"}
Vulnerability counter: ${vulnerability_counter || "Not specified"}
Define brief: ${define_brief || "Not generated"}

=== IDEA ===
Credible advantages: ${advantagesList}
Promise 1: ${promise_1 || "Not specified"}
Promise 2: ${promise_2 || "Not specified"}
Promise 3: ${promise_3 || "Not specified"}
Unique pledge: ${unique_pledge || "Not specified"}
Why now: ${why_now || "Not specified"}
Idea audit: ${idea_audit || "Not generated"}

=== DEVELOP (Manifesto) ===
${manifesto ? JSON.stringify(manifesto, null, 2) : "Not generated"}

=== MEASURE ===
Defense claims: ${
      Array.isArray(defense_claims)
        ? defense_claims.join("\n- ")
        : defense_claims || "Not specified"
    }
Inoculations: ${
      Array.isArray(inoculations)
        ? inoculations.join("\n- ")
        : inoculations || "Not specified"
    }

Produce the Narrative Intelligence Assessment now — exactly 3 sentences.`;

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
          assessment: null,
          precedent: null,
          precedent_entry_id: null,
          error: "No assessment generated.",
        },
        { status: 500 }
      );
    }

    const parsed = parsePrecedent(raw);

    return Response.json({
      assessment: parsed.assessment,
      precedent: parsed.precedent,
      precedent_entry_id: parsed.entry_id,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Perceptions synthesis error:", message);
    return Response.json(
      {
        assessment: null,
        precedent: null,
        precedent_entry_id: null,
        error: `Synthesis failed: ${message}`,
      },
      { status: 500 }
    );
  }
}
