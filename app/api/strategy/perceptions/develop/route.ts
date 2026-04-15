import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are The Right Hand. You are in the DEVELOP phase — generating a complete manifesto architecture from the brand narrative inputs across DISCOVER, DEFINE, and IDEA.

You have been given:
- Voter dominant emotion and problem statements (DISCOVER)
- Candidate positioning statement and differentiator (DEFINE)
- Three campaign promises and unique constituency pledge (IDEA)

Generate a complete manifesto in exactly the following structure. Return as JSON with these exact keys:

{
  "vision_statement": "One sentence. The future. Specific to this constituency.",
  "who_i_am": "Two sentences. Personal and grounded. Connects candidate background to voter problems. Not a CV — a human connection.",
  "pledge_1": { "commitment": "...", "accountability": "..." },
  "pledge_2": { "commitment": "...", "accountability": "..." },
  "pledge_3": { "commitment": "...", "accountability": "..." },
  "constituency_promise": "One paragraph (3-4 sentences)...",
  "call_to_action": "One sentence. Gives the voter agency..."
}

CRITICAL RULES:
- Use plain language. No political jargon.
- Be specific. Name places, numbers, timelines where possible.
- Build from the inputs — do not generate generic manifesto content.
- The vision statement must connect to the dominant voter emotion.
- The constituency promise must be genuinely specific to this candidate.
- Return ONLY valid JSON. No markdown. No explanation.`;

const SECTION_REGEN_PROMPT = `You are The Right Hand. You are in the DEVELOP phase — regenerating a single section of a previously generated manifesto while keeping the rest intact.

Using the same DISCOVER, DEFINE, IDEA inputs and the existing manifesto context, regenerate ONLY the requested section with the same structural rules that applied originally:

- Use plain language. No political jargon.
- Be specific. Name places, numbers, timelines where possible.
- Build from the inputs — do not generate generic content.
- Return ONLY valid JSON for the requested key. No markdown. No explanation.

If the requested section is a pledge (pledge_1, pledge_2, pledge_3), return JSON of shape { "commitment": "...", "accountability": "..." }. Otherwise return a JSON string value for the key as { "<key>": "..." }.`;

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

function stripJsonFence(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }
  return trimmed;
}

function buildUserPayload(data: Record<string, unknown>): string {
  const advantages = Array.isArray(data.credible_advantages)
    ? (data.credible_advantages as string[]).join("; ")
    : (data.credible_advantages as string) || "Not specified";

  return `Election type: ${data.election_type || "constituency"}

DISCOVER inputs:
- Dominant voter emotion: ${data.dominant_emotion || "Not specified"}
- Problem 1: ${data.problem_1 || "Not specified"}
- Problem 2: ${data.problem_2 || "Not specified"}
- Problem 3: ${data.problem_3 || "Not specified"}
- Who voters blame: ${data.who_they_blame || "Not specified"}
- What voters want most: ${data.what_they_want_most || "Not specified"}
- Current perception: ${data.current_perception || "Not specified"}

DEFINE inputs:
- Candidate identity: ${data.candidate_identity || "Not specified"}
- Contrast with opponent: ${data.contrast || "Not specified"}
- Positioning statement: ${data.positioning_statement || "Not specified"}
- The one thing voters must remember: ${data.one_thing || "Not specified"}
- Vulnerability: ${data.vulnerability || "Not specified"}
- Vulnerability counter: ${data.vulnerability_counter || "Not specified"}

IDEA inputs:
- Credible advantages: ${advantages}
- Promise 1: ${data.promise_1 || "Not specified"}
- Promise 2: ${data.promise_2 || "Not specified"}
- Promise 3: ${data.promise_3 || "Not specified"}
- Unique constituency pledge: ${data.unique_pledge || "Not specified"}
- Why now / urgency: ${data.why_now || "Not specified"}

Constituency / context: ${data.constituency || "Not specified"}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { regenerate_section, existing_manifesto, ...data } = body;

    const userBase = buildUserPayload(data);

    if (regenerate_section) {
      const userMessage = `${userBase}

Existing manifesto (for consistency — do not return this, only the regenerated section):
${existing_manifesto ? JSON.stringify(existing_manifesto, null, 2) : "None provided."}

Regenerate ONLY this section: ${regenerate_section}

Return ONLY valid JSON for that single key. No markdown. No explanation.`;

      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        system: SECTION_REGEN_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      });

      const raw = stripJsonFence(extractText(response));

      try {
        const parsed = JSON.parse(raw);
        return Response.json({
          section: regenerate_section,
          value: parsed[regenerate_section] ?? parsed,
        });
      } catch {
        return Response.json(
          {
            section: regenerate_section,
            value: null,
            error: "Failed to parse regenerated section JSON.",
            raw,
          },
          { status: 500 }
        );
      }
    }

    const userMessage = `${userBase}

Generate the complete manifesto now. Return ONLY the JSON object — no markdown fences, no commentary.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = stripJsonFence(extractText(response));

    try {
      const manifesto = JSON.parse(raw);
      return Response.json({ manifesto });
    } catch {
      return Response.json(
        {
          manifesto: null,
          error: "Failed to parse manifesto JSON.",
          raw,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Perceptions develop error:", message);
    return Response.json(
      { manifesto: null, error: `Develop generation failed: ${message}` },
      { status: 500 }
    );
  }
}
