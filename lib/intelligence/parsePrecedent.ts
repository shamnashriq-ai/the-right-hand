export interface ParsedPrecedent {
  assessment: string;
  precedent: string | null;
  entry_id: string | null;
}

const PRECEDENT_PREFIX = "PRECEDENT:";
const ENTRY_ID_DELIMITER = "|| entry_id:";

export function parsePrecedent(raw: string): ParsedPrecedent {
  if (!raw || typeof raw !== "string") {
    return { assessment: "", precedent: null, entry_id: null };
  }

  const lines = raw.split(/\r?\n/);
  let precedentLineIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith(PRECEDENT_PREFIX)) {
      precedentLineIndex = i;
      break;
    }
  }

  if (precedentLineIndex === -1) {
    return {
      assessment: raw.trim(),
      precedent: null,
      entry_id: null,
    };
  }

  const precedentLine = lines[precedentLineIndex].trim();
  const assessmentLines = [
    ...lines.slice(0, precedentLineIndex),
    ...lines.slice(precedentLineIndex + 1),
  ];
  const assessment = assessmentLines.join("\n").trim();

  const body = precedentLine.slice(PRECEDENT_PREFIX.length).trim();
  const delimiterIndex = body.indexOf(ENTRY_ID_DELIMITER);

  if (delimiterIndex === -1) {
    return {
      assessment,
      precedent: body.length > 0 ? body : null,
      entry_id: null,
    };
  }

  const precedent = body.slice(0, delimiterIndex).trim();
  const entry_id = body.slice(delimiterIndex + ENTRY_ID_DELIMITER.length).trim();

  return {
    assessment,
    precedent: precedent.length > 0 ? precedent : null,
    entry_id: entry_id.length > 0 ? entry_id : null,
  };
}
