export type Severity = "minor" | "significant" | "critical";
export type Reach = "contained" | "growing" | "viral";
export type PerceptionMomentum = "positive" | "neutral" | "negative" | "deteriorating";
export type StrategyAdherence = "executing" | "drifting" | "pivoting";
export type OpponentStrength = "weak" | "moderate" | "strong";

export interface OpponentMove {
  id: string;
  category: string;
  severity: Severity;
  district?: string;
  details?: string;
  loggedAt: string;
  aiResponse?: string;
}

export interface NarrativeThreat {
  id: string;
  type: string;
  platform: string;
  reach: Reach;
  loggedAt: string;
  inoculationStatement?: string;
}

export interface DailySnapshot {
  date: string;
  contactsToday: number;
  districtsActive: number;
  perceptionMomentum: PerceptionMomentum;
  strategyAdherence: StrategyAdherence;
  strategyNote?: string;
}

export interface ScorecardState {
  contactsToday: number;
  districtsCoveredThisWeek: number;
  districtsCoveredLastWeek: number;
  perceptionMomentum: PerceptionMomentum;
  strategyAdherence: StrategyAdherence;
  strategyNote: string;
}

export interface WarRoomData {
  // Campaign context (can be populated from URL params on first load)
  candidateName: string;
  constituency: string;
  pollingDate: string; // ISO date
  opponentStrength: OpponentStrength;

  // Spider chart inputs
  districtsActive: number;
  totalDistricts: number;
  totalContactsLogged: number;
  daysElapsed: number;
  contactsThisWeek: number;
  contactsPreviousWeek: number;
  endorsementsSecured: number;
  activeVolunteers: number;
  branchesActive: number;
  budgetRemaining: number;
  dailyCampaignCost: number;

  // Narrative composite (0 or 25 each, plus 0-35 brand, 0-15 defense)
  archetypeComplete: boolean;
  manifestoComplete: boolean;
  brandPhasesComplete: number; // 0-5
  defenseClaimsComplete: number; // 0-5

  // F3 inputs for Days-to-Gap + volunteer target
  voteGap: number;
  daysRemaining: number;
  dailyTarget: number;

  // Scorecards (live operational)
  scorecards: ScorecardState;

  // Logs
  opponentMoves: OpponentMove[];
  narrativeThreats: NarrativeThreat[];
  dailySnapshots: DailySnapshot[];

  // Meta
  lastUpdated: string;
  campaignId?: string;
}

export const defaultWarRoomData: WarRoomData = {
  candidateName: "",
  constituency: "",
  pollingDate: "",
  opponentStrength: "moderate",

  districtsActive: 0,
  totalDistricts: 0,
  totalContactsLogged: 0,
  daysElapsed: 0,
  contactsThisWeek: 0,
  contactsPreviousWeek: 0,
  endorsementsSecured: 0,
  activeVolunteers: 0,
  branchesActive: 0,
  budgetRemaining: 0,
  dailyCampaignCost: 0,

  archetypeComplete: false,
  manifestoComplete: false,
  brandPhasesComplete: 0,
  defenseClaimsComplete: 0,

  voteGap: 0,
  daysRemaining: 0,
  dailyTarget: 0,

  scorecards: {
    contactsToday: 0,
    districtsCoveredThisWeek: 0,
    districtsCoveredLastWeek: 0,
    perceptionMomentum: "neutral",
    strategyAdherence: "executing",
    strategyNote: "",
  },

  opponentMoves: [],
  narrativeThreats: [],
  dailySnapshots: [],

  lastUpdated: new Date(0).toISOString(),
};

export interface AxisScores {
  ground: number;
  numbers: number;
  narrative: number;
  organisation: number;
  momentum: number;
  resources: number;
}

export interface SpiderData {
  candidate: AxisScores;
  opponent: AxisScores;
}
