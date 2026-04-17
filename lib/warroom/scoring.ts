import { WarRoomData, AxisScores, SpiderData, OpponentStrength } from "./types";

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

const OPPONENT_STRENGTH_SCORE: Record<OpponentStrength, number> = {
  weak: 30,
  moderate: 60,
  strong: 85,
};

const OPPONENT_RESOURCE_SCORE: Record<OpponentStrength, number> = {
  weak: 30,
  moderate: 60,
  strong: 90,
};

function minutesSince(iso: string): number {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return Infinity;
  return (Date.now() - then) / 60000;
}

function countThisWeek(items: { loggedAt: string }[]): number {
  const sevenDays = 7 * 24 * 60;
  return items.filter((item) => minutesSince(item.loggedAt) <= sevenDays).length;
}

export function computeCandidateScores(d: WarRoomData): AxisScores {
  // Ground
  const ground =
    d.totalDistricts > 0 ? clamp((d.districtsActive / d.totalDistricts) * 100) : 50;

  // Numbers
  const expectedByNow = d.dailyTarget * d.daysElapsed;
  const numbers =
    expectedByNow > 0 && d.totalContactsLogged > 0
      ? clamp(Math.round((d.totalContactsLogged / expectedByNow) * 50))
      : 50;

  // Narrative composite
  const archetypePts = d.archetypeComplete ? 25 : 0;
  const manifestoPts = d.manifestoComplete ? 25 : 0;
  const brandPts = clamp(d.brandPhasesComplete * 7, 0, 35);
  const defensePts = clamp(d.defenseClaimsComplete * 3, 0, 15);
  const narrative = clamp(archetypePts + manifestoPts + brandPts + defensePts);

  // Organisation composite
  const requiredVolunteers = Math.max(1, Math.ceil(d.voteGap / 14));
  const volunteerPts = clamp((d.activeVolunteers / requiredVolunteers) * 50, 0, 50);
  const endorsementPts = clamp(d.endorsementsSecured * 10, 0, 30);
  const branchPts =
    d.totalDistricts > 0
      ? clamp((d.branchesActive / d.totalDistricts) * 20, 0, 20)
      : 0;
  const organisation = clamp(Math.round(volunteerPts + endorsementPts + branchPts));

  // Momentum
  const movesThisWeek = countThisWeek(d.opponentMoves);
  const threatsThisWeek = countThisWeek(d.narrativeThreats);
  const contactTrend =
    d.contactsPreviousWeek > 0
      ? (d.contactsThisWeek / d.contactsPreviousWeek) * 50
      : 50;
  const threatPenalty = Math.min(20, movesThisWeek * 5 + threatsThisWeek * 3);
  const momentum = clamp(Math.round(contactTrend - threatPenalty));

  // Resources
  const resourceRunwayDays = d.dailyCampaignCost > 0 ? d.daysRemaining : 0;
  const resources =
    d.dailyCampaignCost > 0 && resourceRunwayDays > 0
      ? clamp(
          Math.round(
            (d.budgetRemaining / (d.dailyCampaignCost * resourceRunwayDays)) * 100
          )
        )
      : 50;

  return { ground, numbers, narrative, organisation, momentum, resources };
}

export function computeOpponentScores(d: WarRoomData, cand: AxisScores): AxisScores {
  const base = OPPONENT_STRENGTH_SCORE[d.opponentStrength];
  return {
    ground: base,
    numbers: clamp(100 - cand.numbers),
    narrative: base,
    organisation: base,
    momentum: clamp(100 - cand.momentum),
    resources: OPPONENT_RESOURCE_SCORE[d.opponentStrength],
  };
}

export function computeSpiderData(d: WarRoomData): SpiderData {
  const candidate = computeCandidateScores(d);
  const opponent = computeOpponentScores(d, candidate);
  return { candidate, opponent };
}

export function compositeHealth(scores: AxisScores): number {
  const { ground, numbers, narrative, organisation, momentum, resources } = scores;
  return Math.round(
    (ground + numbers + narrative + organisation + momentum + resources) / 6
  );
}

export function weakestAxis(scores: AxisScores): { key: keyof AxisScores; score: number } {
  const entries = Object.entries(scores) as [keyof AxisScores, number][];
  entries.sort((a, b) => a[1] - b[1]);
  return { key: entries[0][0], score: entries[0][1] };
}

export interface DaysToGapResult {
  status: "on-track" | "behind" | "critical";
  currentDailyRate: number;
  projectedTotalContacts: number;
  projectedVotesClosed: number;
  projectedShortfall: number;
  neededIncrease: number;
  targetRate: number;
  statusLine: string;
}

export const CONVERSION_RATE = 0.7;

export function computeDaysToGap(d: WarRoomData): DaysToGapResult | null {
  if (d.voteGap <= 0 || d.daysRemaining <= 0) return null;

  const currentDailyRate =
    d.daysElapsed > 0 ? d.totalContactsLogged / d.daysElapsed : 0;

  const projectedTotalContacts =
    d.totalContactsLogged + currentDailyRate * d.daysRemaining;
  const projectedVotesClosed = projectedTotalContacts * CONVERSION_RATE;
  const projectedShortfall = Math.max(0, d.voteGap - projectedVotesClosed);

  const threshold = d.voteGap * 0.15;
  const status: DaysToGapResult["status"] =
    projectedShortfall <= 0
      ? "on-track"
      : projectedShortfall <= threshold
        ? "behind"
        : "critical";

  const neededContacts = d.voteGap / CONVERSION_RATE;
  const targetRate =
    d.daysRemaining > 0
      ? Math.max(
          currentDailyRate,
          (neededContacts - d.totalContactsLogged) / d.daysRemaining
        )
      : currentDailyRate;
  const neededIncrease = Math.max(0, Math.ceil(targetRate - currentDailyRate));

  let statusLine = "";
  if (status === "on-track") {
    const surplus = Math.round(projectedVotesClosed - d.voteGap);
    statusLine = `ON TRACK — projected to close gap with ${surplus.toLocaleString()} votes to spare at current pace.`;
  } else if (status === "behind") {
    statusLine = `BEHIND — projected shortfall of ~${Math.round(projectedShortfall).toLocaleString()} votes. Increase daily contacts by ${neededIncrease} (from ${Math.round(currentDailyRate)} to ${Math.ceil(targetRate)}) to close.`;
  } else {
    statusLine = `CRITICAL — projected shortfall of ~${Math.round(projectedShortfall).toLocaleString()} votes. Current pace insufficient. Expand machinery immediately.`;
  }

  return {
    status,
    currentDailyRate,
    projectedTotalContacts,
    projectedVotesClosed,
    projectedShortfall,
    neededIncrease,
    targetRate,
    statusLine,
  };
}
