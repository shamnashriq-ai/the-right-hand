import Anthropic from "@anthropic-ai/sdk";
import { getEntry, library } from "@/lib/intelligence/library";

const client = new Anthropic();

const BASE_SYSTEM_PROMPT = `Given the complete campaign strategy profile provided, select exactly three entries from the intelligence library that are most relevant to this specific candidate's strategic situation:

1. The most relevant GLOBAL campaign precedent (non-Malaysian)
2. The most relevant MALAYSIAN campaign precedent
3. The most relevant SCHOLARLY framework

Return as JSON:
{
  "global": "entry_id",
  "malaysian": "entry_id",
  "scholar": "entry_id",
  "global_application": "1-2 sentences on why this global precedent applies specifically to this candidate's situation",
  "malaysian_application": "1-2 sentences on the Malaysian parallel",
  "scholar_application": "1-2 sentences on how this framework explains the candidate's most critical strategic variable"
}

Available entries: reagan-1980, mahathir-1981, obama-2008, mamdani-2025, syed-saddiq-2022, khairy-2009, sun-tzu, machiavelli, alinsky, edelman, lasswell, vo-key, downs, lees-marshment

Return ONLY valid JSON. No markdown. No explanation.`;

const INTERNAL_APPENDIX = `

Note: this is a party internal election. Prioritise precedents from internal party contests. The Khairy 2009 UMNO Youth Chief contest and Mahathir's UMNO machinery architecture are the most relevant Malaysian precedents for this context.`;

function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

function stripJsonFences(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "");
    if (t.endsWith("```")) {
      t = t.slice(0, -3);
    }
  }
  return t.trim();
}

interface DigestSelection {
  global: string;
  malaysian: string;
  scholar: string;
  global_application: string;
  malaysian_application: string;
  scholar_application: string;
}

function validateSelection(sel: DigestSelection): string | null {
  const globalEntry = getEntry(sel.global);
  const malaysianEntry = getEntry(sel.malaysian);
  const scholarEntry = getEntry(sel.scholar);

  if (!globalEntry) return `Unknown global entry_id: ${sel.global}`;
  if (!malaysianEntry) return `Unknown malaysian entry_id: ${sel.malaysian}`;
  if (!scholarEntry) return `Unknown scholar entry_id: ${sel.scholar}`;

  if (globalEntry.type !== "campaign" || globalEntry.origin === "Malaysia") {
    return `Global selection must be a non-Malaysian campaign (got ${globalEntry.type} from ${globalEntry.origin})`;
  }
  if (malaysianEntry.type !== "campaign" || malaysianEntry.origin !== "Malaysia") {
    return `Malaysian selection must be a Malaysian campaign (got ${malaysianEntry.type} from ${malaysianEntry.origin})`;
  }
  if (scholarEntry.type !== "scholar" && scholarEntry.type !== "tactician") {
    return `Scholar selection must be a scholar or tactician (got ${scholarEntry.type})`;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { election_type } = body;

    const systemPrompt =
      election_type === "internal"
        ? BASE_SYSTEM_PROMPT + INTERNAL_APPENDIX
        : BASE_SYSTEM_PROMPT;

    const availableIds = library.map((e) => e.id).join(", ");

    const userMessage = `Full candidate strategy profile (all 5 framework inputs):

${JSON.stringify(body, null, 2)}

Available library entry_ids: ${availableIds}

Select the three most relevant precedents and return the JSON object now.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = extractText(response);
    if (!raw) {
      return Response.json(
        { error: "No digest generated." },
        { status: 500 }
      );
    }

    let parsed: DigestSelection;
    try {
      parsed = JSON.parse(stripJsonFences(raw));
    } catch (parseError: unknown) {
      const msg =
        parseError instanceof Error ? parseError.message : "parse failed";
      return Response.json(
        { error: `Digest JSON parse failed: ${msg}`, raw },
        { status: 500 }
      );
    }

    const validationError = validateSelection(parsed);
    if (validationError) {
      return Response.json(
        { error: validationError, selection: parsed },
        { status: 500 }
      );
    }

    return Response.json(parsed);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Strategy digest error:", message);
    return Response.json(
      { error: `Digest generation failed: ${message}` },
      { status: 500 }
    );
  }
}
