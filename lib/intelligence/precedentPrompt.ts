export const PRECEDENT_PROMPT_APPENDIX = `

After your 3-sentence assessment, add exactly one more line beginning with the token PRECEDENT: followed by a citation in this format:

PRECEDENT: [Name] · [Source] · [Year] · [One sentence on why this specific precedent applies to this specific candidate's situation right now — not generically, but specifically to the numbers and context provided] || entry_id: [one of: reagan-1980, mahathir-1981, obama-2008, mamdani-2025, syed-saddiq-2022, khairy-2009, sun-tzu, machiavelli, alinsky, edelman, lasswell, vo-key, downs, lees-marshment]

Choose from this library:
- reagan-1980: known_not_trusted perception gap, reframing strategy
- mahathir-1981: UMNO internal, obligation network mobilisation
- obama-2008: ground intelligence before media spend, coverage gaps
- mamdani-2025: outspent underdog, volunteer depth, issue monopoly
- syed-saddiq-2022: Malaysian defending under attack, service as machinery
- khairy-2009: UMNO internal, three-cornered, vote-split architecture
- sun-tzu: ground preparation, concentration of force
- machiavelli: perception management, appearance vs substance
- alinsky: power projection, underdog mobilisation
- edelman: symbolic politics, emotional register
- lasswell: voter anxiety diagnosis, private motivation
- vo-key: inoculation strategy, proactive defense
- downs: multi-candidate positioning, distinct territory
- lees-marshment: market-oriented strategy, voter intelligence first

Select the single most relevant precedent to this specific situation. If none is clearly relevant, do not include a PRECEDENT line.`;

export const PRECEDENT_INTERNAL_APPENDIX = `

Election context: party internal election. Favour Khairy 2009, Mahathir 1981, or Machiavelli-type precedents when strategically relevant.`;

export function buildPrecedentSystemPrompt(
  basePrompt: string,
  electionType?: string
): string {
  let prompt = basePrompt + PRECEDENT_PROMPT_APPENDIX;
  if (electionType === "internal") {
    prompt += PRECEDENT_INTERNAL_APPENDIX;
  }
  return prompt;
}
