import { getEntry, type IntelligenceEntry } from "./library";

interface GroundContext {
  candidateStatus?: string;
  opponentStrength?: string;
  partyBrand?: string;
  candidatesContesting?: string;
  classification?: string;
  daysUntilPolling?: number;
}

interface MobilisationContext {
  coveragePercent?: number;
  paceStatus?: string;
  volunteers?: number;
  gapPercent?: number;
  mobilisationChannel?: string;
}

interface InternalContext {
  numberOfContestants?: number;
  incumbentStatus?: string;
  factionAlignment?: string;
  commitRate?: number;
}

function formatPrecedent(entry: IntelligenceEntry, reason: string): { precedent: string; precedent_entry_id: string } {
  const yearStr = entry.year < 0 ? `c.${Math.abs(entry.year)} BC` : String(entry.year);
  return {
    precedent: `${entry.name} \u00B7 ${entry.source} \u00B7 ${yearStr} \u00B7 ${reason}`,
    precedent_entry_id: entry.id,
  };
}

export function selectGroundPrecedent(ctx: GroundContext): { precedent: string | null; precedent_entry_id: string | null } {
  const isHostile = ctx.partyBrand === "Headwind against us" && ctx.opponentStrength === "Strong — dominant incumbent";
  const multiCorner = ctx.candidatesContesting === "4" || ctx.candidatesContesting === "5+";
  const isChallenger = ctx.candidateStatus === "Challenger";

  if (isHostile && isChallenger) {
    const e = getEntry("syed-saddiq-2022")!;
    return formatPrecedent(e, "Your hostile-seat challenger position mirrors Muar 2022 \u2014 sustained constituency presence is the only asset that overcomes structural disadvantage.");
  }
  if (multiCorner) {
    const e = getEntry("downs")!;
    return formatPrecedent(e, "In this multi-cornered field, Downs\u2019s spatial theory says the candidate who occupies distinct territory wins, not the one who fights for the crowded centre.");
  }
  if (isChallenger && ctx.opponentStrength === "Strong — dominant incumbent") {
    const e = getEntry("obama-2008")!;
    return formatPrecedent(e, "Challenging a dominant incumbent requires Obama-level ground intelligence \u2014 map the terrain before spending a single ringgit on media.");
  }
  const e = getEntry("sun-tzu")!;
  return formatPrecedent(e, "Know the ground before you march \u2014 your campaign\u2019s first task is terrain intelligence, not voter persuasion.");
}

export function selectMobilisationPrecedent(ctx: MobilisationContext): { precedent: string | null; precedent_entry_id: string | null } {
  if ((ctx.gapPercent ?? 0) > 40) {
    const e = getEntry("obama-2008")!;
    return formatPrecedent(e, "With over 40% coverage gap, Obama\u2019s Iowa principle applies \u2014 fill the map before filling the airwaves.");
  }
  if (ctx.paceStatus === "BEHIND") {
    const e = getEntry("alinsky")!;
    return formatPrecedent(e, "Behind pace with limited resources \u2014 Alinsky says project power through visible discipline, converting perception of momentum into real momentum.");
  }
  if ((ctx.volunteers ?? 0) > 100 && ctx.mobilisationChannel === "Door to door") {
    const e = getEntry("mamdani-2025")!;
    return formatPrecedent(e, "Your volunteer depth mirrors Mamdani\u2019s NYC model \u2014 believers knocking doors convert at higher rates than any paid canvassing operation.");
  }
  const e = getEntry("lees-marshment")!;
  return formatPrecedent(e, "Market-oriented mobilisation starts with voter intelligence \u2014 deploy resources where the data says they\u2019ll move votes, not where tradition says to go.");
}

export function selectInternalPrecedent(ctx: InternalContext): { precedent: string | null; precedent_entry_id: string | null } {
  if ((ctx.numberOfContestants ?? 2) >= 3) {
    const e = getEntry("khairy-2009")!;
    return formatPrecedent(e, "Three-cornered internal contests are won by architecting the vote split \u2014 your arithmetic must account for how the opposition vote distributes, not just how yours consolidates.");
  }
  if (ctx.incumbentStatus === "Challenging incumbent") {
    const e = getEntry("mahathir-1981")!;
    return formatPrecedent(e, "Challenging an internal incumbent requires obligation network architecture \u2014 map who owes whom before attempting persuasion.");
  }
  const e = getEntry("khairy-2009")!;
  return formatPrecedent(e, "Internal party contests are delegate arithmetic \u2014 every contact must be tracked, every commitment confirmed, every leaner personally cultivated.");
}
