import { AxisScores } from "./types";

export type AxisKey = keyof AxisScores;

export const PUBLIC_AXIS_LABELS: Record<AxisKey, string> = {
  ground: "Ground",
  numbers: "Numbers",
  narrative: "Narrative",
  organisation: "Organisation",
  momentum: "Momentum",
  resources: "Resources",
};

export const INTERNAL_AXIS_LABELS: Record<AxisKey, string> = {
  ground: "Division Coverage",
  numbers: "Delegate Count",
  narrative: "Internal Positioning",
  organisation: "Cultivation Depth",
  momentum: "Cultivation Momentum",
  resources: "Access & Relationships",
};

export function axisLabels(isInternal: boolean): Record<AxisKey, string> {
  return isInternal ? INTERNAL_AXIS_LABELS : PUBLIC_AXIS_LABELS;
}

export const PUBLIC_MOVE_CATEGORIES = [
  "Flooding our swing districts with machinery",
  "Launched negative campaign against us",
  "Co-opted our dominant issue",
  "Building coalition with third candidate",
  "Deploying resources to community leaders",
  "Distributing incentives in key areas",
  "Media attack — press statement or interview",
  "Social media coordinated attack",
  "Custom — describe below",
];

export const INTERNAL_MOVE_CATEGORIES = [
  "Flooding key division leaders",
  "Launched whisper campaign against us",
  "Co-opted our reform narrative",
  "Opponent coordination detected",
  "Deploying resources to delegate cultivators",
  "Distributing incentives to key delegates",
  "Leadership endorsement against us",
  "Faction coordination move",
  "Custom — describe below",
];

export function moveCategories(isInternal: boolean): string[] {
  return isInternal ? INTERNAL_MOVE_CATEGORIES : PUBLIC_MOVE_CATEGORIES;
}

export const THREAT_TYPES = [
  "False claim about my background or record",
  "Attack on my party or faction",
  "Association with discredited figure",
  "Competence challenge — 'too young / inexperienced'",
  "Absence attack — 'never here before the election'",
  "Financial or integrity allegation",
  "Personal or family attack",
  "Social media coordinated campaign",
  "Community leader turning against us",
];

export const THREAT_PLATFORMS = [
  "WhatsApp — spreading in community groups",
  "Facebook — public posts or ads",
  "TikTok — video content",
  "Word of mouth — ground level",
  "Traditional media — press or TV",
  "Multiple channels",
];
