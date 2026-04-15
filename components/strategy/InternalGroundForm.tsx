"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Handshake,
  Crown,
  Brain,
  Shield,
  Globe,
  Search,
  AlertTriangle,
  TrendingUp,
  Crosshair,
  Copy,
  Check,
  Network,
} from "lucide-react";
import PrecedentPulse from "@/components/intelligence/PrecedentPulse";
import PrecedentModal from "@/components/intelligence/PrecedentModal";

export interface InternalGroundData {
  partyName: string;
  positionContested: string;
  electionLevel: string;
  totalDelegates: number;
  delegateSource: string;
  committedDelegates: number;
  leaningDelegates: number;
  uncommittedDelegates: number;
  hostileDelegates: number;
  keyBrokers: string;
  factionAlignment: string;
  incumbentStatus: string;
  numberOfContestants: string;
  strongestOpponent: string;
  patronageCapacity: string;
  topInternalIssue: string;
  daysUntilElection: number;
}

const defaultData: InternalGroundData = {
  partyName: "",
  positionContested: "",
  electionLevel: "",
  totalDelegates: 0,
  delegateSource: "",
  committedDelegates: 0,
  leaningDelegates: 0,
  uncommittedDelegates: 0,
  hostileDelegates: 0,
  keyBrokers: "",
  factionAlignment: "",
  incumbentStatus: "",
  numberOfContestants: "",
  strongestOpponent: "",
  patronageCapacity: "",
  topInternalIssue: "",
  daysUntilElection: 0,
};

const electionLevels = [
  "Division",
  "Branch",
  "Wing (Youth/Wanita/Puteri)",
  "Supreme Council / CEC",
  "State Liaison",
  "National",
];

const delegateSources = [
  "Branch delegates",
  "Division delegates",
  "Automatic delegates (ex-officio)",
  "Mixed / multi-tier",
];

const factionOptions = [
  "Aligned with dominant faction",
  "Aligned with challenger faction",
  "Neutral / independent",
  "Building own faction",
];

const incumbentStatuses = [
  "Challenging incumbent",
  "Defending position",
  "Open contest (no incumbent)",
  "Incumbent not recontesting",
];

const contestantOptions = ["2", "3", "4", "5+"];

const patronageOptions = [
  "Strong \u2014 can deliver tangible benefits",
  "Moderate \u2014 some access to resources",
  "Limited \u2014 running on credibility alone",
];

function RadioCards({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-[var(--text-muted)] block mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${
                value === opt
                  ? "bg-[var(--gold-dim)] text-[var(--gold)] border-[var(--gold-border)]"
                  : "bg-transparent text-[var(--text-secondary)] border-[rgba(255,255,255,0.1)] hover:border-[var(--gold-border)]"
              }
            `}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// Parse the structured briefing into sections
function parseBriefing(text: string) {
  const sections: {
    powerStructure: string;
    delegateDynamics: string;
    hiddenRisks: string;
    strategicImplication: string;
  } = {
    powerStructure: "",
    delegateDynamics: "",
    hiddenRisks: "",
    strategicImplication: "",
  };

  const powerMatch = text.match(
    /POWER STRUCTURE\s*\n([\s\S]*?)(?=DELEGATE DYNAMICS|$)/i
  );
  const delegateMatch = text.match(
    /DELEGATE DYNAMICS.*?\n([\s\S]*?)(?=HIDDEN RISKS|$)/i
  );
  const risksMatch = text.match(
    /HIDDEN RISKS.*?\n([\s\S]*?)(?=STRATEGIC IMPLICATION|$)/i
  );
  const stratMatch = text.match(/STRATEGIC IMPLICATION\s*\n([\s\S]*?)$/i);

  if (powerMatch) sections.powerStructure = powerMatch[1].trim();
  if (delegateMatch) sections.delegateDynamics = delegateMatch[1].trim();
  if (risksMatch) sections.hiddenRisks = risksMatch[1].trim();
  if (stratMatch) sections.strategicImplication = stratMatch[1].trim();

  if (
    !sections.powerStructure &&
    !sections.delegateDynamics &&
    !sections.hiddenRisks &&
    !sections.strategicImplication
  ) {
    sections.powerStructure = text;
  }

  return sections;
}

export default function InternalGroundForm() {
  const [data, setData] = useState<InternalGroundData>(defaultData);
  const [aiAssessment, setAiAssessment] = useState("");
  const [intPrecedent, setIntPrecedent] = useState<string | null>(null);
  const [intEntryId, setIntEntryId] = useState<string | null>(null);
  const [intIntelPrecedent, setIntIntelPrecedent] = useState<string | null>(null);
  const [intIntelEntryId, setIntIntelEntryId] = useState<string | null>(null);
  const [modalEntryId, setModalEntryId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [intelBriefing, setIntelBriefing] = useState<string | null>(null);
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelError, setIntelError] = useState<string | null>(null);
  const [intelSearched, setIntelSearched] = useState(false);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intelDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSearchedParty = useRef<string>("");

  const update = useCallback(
    (field: keyof InternalGroundData, value: string | number) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Derived intelligence
  const hasEnoughData =
    data.partyName &&
    data.positionContested &&
    data.totalDelegates > 0 &&
    data.incumbentStatus &&
    data.daysUntilElection > 0;

  // Delegate math
  const totalAccounted =
    data.committedDelegates +
    data.leaningDelegates +
    data.uncommittedDelegates +
    data.hostileDelegates;
  const commitRate =
    data.totalDelegates > 0
      ? Math.round((data.committedDelegates / data.totalDelegates) * 100)
      : 0;
  const winThreshold =
    data.totalDelegates > 0 ? Math.ceil(data.totalDelegates / 2) + 1 : 0;
  const delegatesNeeded = Math.max(0, winThreshold - data.committedDelegates);
  const pathToWin =
    data.totalDelegates > 0
      ? data.committedDelegates + data.leaningDelegates >= winThreshold
      : false;

  // Situation label for internal
  const situationLabel = (() => {
    if (!data.incumbentStatus || data.totalDelegates === 0) return null;
    if (commitRate >= 60) return "COMMANDING";
    if (commitRate >= 45 && pathToWin) return "COMPETITIVE";
    if (commitRate >= 30) return "CONTESTED";
    return "UPHILL";
  })();

  const situationColor = (() => {
    switch (situationLabel) {
      case "COMMANDING":
        return "var(--green)";
      case "COMPETITIVE":
        return "var(--gold)";
      case "CONTESTED":
        return "var(--amber)";
      case "UPHILL":
        return "var(--red)";
      default:
        return "var(--text-muted)";
    }
  })();

  // AI assessment for internal
  useEffect(() => {
    if (hasEnoughData) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setAiLoading(true);
        try {
          const res = await fetch("/api/strategy/ground-internal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const result = await res.json();
          setAiAssessment(
            result.assessment || "Unable to generate assessment."
          );
          setIntPrecedent(result.precedent || null);
          setIntEntryId(result.precedent_entry_id || null);
        } catch {
          setAiAssessment(
            "Connection error. Check your network and try again."
          );
        } finally {
          setAiLoading(false);
        }
      }, 1200);
    }
  }, [data, hasEnoughData]);

  // Internal Intelligence Briefing — fires when party + position entered
  useEffect(() => {
    const searchKey = `${data.partyName.trim()} ${data.positionContested.trim()}`;
    if (
      data.partyName.trim().length >= 2 &&
      data.positionContested.trim().length >= 3 &&
      searchKey !== lastSearchedParty.current
    ) {
      if (intelDebounceRef.current) clearTimeout(intelDebounceRef.current);
      intelDebounceRef.current = setTimeout(async () => {
        lastSearchedParty.current = searchKey;
        setIntelLoading(true);
        setIntelError(null);
        setIntelBriefing(null);
        setIntelSearched(true);
        try {
          const res = await fetch("/api/strategy/ground-internal-intelligence", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              partyName: data.partyName.trim(),
              positionContested: data.positionContested.trim(),
              electionLevel: data.electionLevel,
              incumbentStatus: data.incumbentStatus,
              daysRemaining: data.daysUntilElection,
            }),
          });
          const result = await res.json();
          if (result.briefing) {
            setIntelBriefing(result.briefing);
            setIntIntelPrecedent(result.precedent || null);
            setIntIntelEntryId(result.precedent_entry_id || null);
          } else {
            setIntelError(
              result.error || "No intelligence available for this contest."
            );
          }
        } catch {
          setIntelError(
            "Network error. Intelligence briefing unavailable."
          );
        } finally {
          setIntelLoading(false);
        }
      }, 2000);
    }
  }, [
    data.partyName,
    data.positionContested,
    data.electionLevel,
    data.incumbentStatus,
    data.daysUntilElection,
  ]);

  const handleCopyBriefing = () => {
    if (intelBriefing) {
      navigator.clipboard.writeText(intelBriefing);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const briefingSections = intelBriefing ? parseBriefing(intelBriefing) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8">
      {/* LEFT COLUMN — Inputs (40%) */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="space-y-6"
      >
        {/* Section A — Contest Profile */}
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
          <h3 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
            <Crown size={14} />
            Contest Profile
          </h3>
          <div className="space-y-5">
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">
                Party Name
              </label>
              <input
                type="text"
                value={data.partyName}
                onChange={(e) => update("partyName", e.target.value)}
                placeholder="e.g. UMNO, PKR, DAP, MCA, MIC, Bersatu, Amanah"
                className="w-full bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">
                Position Contested
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.positionContested}
                  onChange={(e) => update("positionContested", e.target.value)}
                  placeholder="e.g. Division Chief, Youth Chief, Vice President, CEC Member"
                  className="w-full bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
                />
                {intelLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-3.5 h-3.5 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
            <RadioCards
              label="Election Level"
              options={electionLevels}
              value={data.electionLevel}
              onChange={(v) => update("electionLevel", v)}
            />
            <RadioCards
              label="Your Status"
              options={incumbentStatuses}
              value={data.incumbentStatus}
              onChange={(v) => update("incumbentStatus", v)}
            />
          </div>
        </div>

        {/* Section B — Delegate Universe */}
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
          <h3 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
            <Users size={14} />
            Delegate Universe
          </h3>
          <div className="space-y-5">
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">
                Total Eligible Delegates
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={data.totalDelegates || ""}
                  onChange={(e) =>
                    update("totalDelegates", parseInt(e.target.value) || 0)
                  }
                  placeholder="0"
                  className="flex-1 bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
                />
                <span className="text-xs text-[var(--text-muted)]">
                  delegates
                </span>
              </div>
            </div>
            <RadioCards
              label="Delegate Source"
              options={delegateSources}
              value={data.delegateSource}
              onChange={(v) => update("delegateSource", v)}
            />

            {/* Delegate headcount breakdown */}
            <div className="bg-[var(--bg-elevated)] rounded-lg p-4 space-y-3">
              <p className="text-xs text-[var(--text-muted)] font-semibold tracking-wider">
                HEADCOUNT BREAKDOWN
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-green-400 block mb-1">
                    Committed
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={data.committedDelegates || ""}
                    onChange={(e) =>
                      update("committedDelegates", parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="w-full bg-[var(--bg-base)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-green-400 focus:outline-none focus:border-green-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--gold)] block mb-1">
                    Leaning
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={data.leaningDelegates || ""}
                    onChange={(e) =>
                      update("leaningDelegates", parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="w-full bg-[var(--bg-base)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-[var(--gold)] focus:outline-none focus:border-[var(--gold-border)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--text-muted)] block mb-1">
                    Uncommitted
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={data.uncommittedDelegates || ""}
                    onChange={(e) =>
                      update("uncommittedDelegates", parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="w-full bg-[var(--bg-base)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-red-400 block mb-1">
                    Hostile
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={data.hostileDelegates || ""}
                    onChange={(e) =>
                      update("hostileDelegates", parseInt(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="w-full bg-[var(--bg-base)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-red-400 focus:outline-none focus:border-red-500/50 transition-colors"
                  />
                </div>
              </div>
              {totalAccounted > 0 && data.totalDelegates > 0 && (
                <p className="text-[10px] text-[var(--text-muted)]">
                  Accounted: {totalAccounted} / {data.totalDelegates}{" "}
                  {totalAccounted !== data.totalDelegates && (
                    <span className="text-[var(--amber)]">
                      ({data.totalDelegates - totalAccounted} unaccounted)
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section C — Power Dynamics */}
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
          <h3 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
            <Network size={14} />
            Power Dynamics
          </h3>
          <div className="space-y-5">
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">
                Key Brokers / Kingmakers
              </label>
              <input
                type="text"
                value={data.keyBrokers}
                onChange={(e) => update("keyBrokers", e.target.value)}
                placeholder="e.g. Dato X controls 15 branch delegates, Tok Y leads the veterans"
                className="w-full bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
              />
            </div>
            <RadioCards
              label="Faction Alignment"
              options={factionOptions}
              value={data.factionAlignment}
              onChange={(v) => update("factionAlignment", v)}
            />
            <RadioCards
              label="Contestants"
              options={contestantOptions}
              value={data.numberOfContestants}
              onChange={(v) => update("numberOfContestants", v)}
            />
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">
                Strongest Opponent
              </label>
              <input
                type="text"
                value={data.strongestOpponent}
                onChange={(e) => update("strongestOpponent", e.target.value)}
                placeholder="e.g. Current deputy with 8 years' tenure"
                className="w-full bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
              />
            </div>
            <RadioCards
              label="Patronage Capacity"
              options={patronageOptions}
              value={data.patronageCapacity}
              onChange={(v) => update("patronageCapacity", v)}
            />
          </div>
        </div>

        {/* Section D — Context */}
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
          <h3 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
            <Handshake size={14} />
            Campaign Context
          </h3>
          <div className="space-y-5">
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">
                Top Internal Issue / Campaign Theme
              </label>
              <input
                type="text"
                value={data.topInternalIssue}
                onChange={(e) => update("topInternalIssue", e.target.value)}
                placeholder="e.g. Party reform, leadership renewal, grassroots neglect"
                className="w-full bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">
                Days Until Election
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={data.daysUntilElection || ""}
                  onChange={(e) =>
                    update(
                      "daysUntilElection",
                      parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                  className="flex-1 bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
                />
                <span className="text-xs text-[var(--text-muted)]">days</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* RIGHT COLUMN — Live Intelligence (60%) */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-6"
      >
        {/* INTERNAL INTELLIGENCE BRIEFING */}
        <AnimatePresence>
          {(intelLoading || intelBriefing || intelError) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(212,175,55,0.2)] p-6 relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--gold)] via-[var(--gold)] to-transparent" />
              <div className="pl-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-[var(--gold)]" />
                    <span className="text-xs font-bold text-[var(--gold)] tracking-wider">
                      INTERNAL INTELLIGENCE BRIEFING
                    </span>
                  </div>
                  {intelBriefing && (
                    <button
                      onClick={handleCopyBriefing}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--bg-elevated)] transition-all"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>

                {intelSearched && data.partyName.trim() && (
                  <p className="text-[10px] text-[var(--text-muted)] mb-4 flex items-center gap-1.5">
                    <Search size={10} />
                    Searching party intelligence for{" "}
                    <span className="text-[var(--gold)]">
                      {data.partyName.trim()} &mdash; {data.positionContested.trim()}
                    </span>
                  </p>
                )}

                {intelLoading && (
                  <div className="space-y-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-[var(--text-secondary)]">
                        Crawling party news, faction dynamics & delegate intelligence...
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[var(--gold)] to-transparent rounded-full"
                          style={{
                            animation: "intelPulse 2s ease-in-out infinite",
                            width: "60%",
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        This may take 10-15 seconds &mdash; searching party intelligence
                      </p>
                    </div>
                  </div>
                )}

                {intelError && !intelLoading && (
                  <div className="flex items-start gap-3 py-2">
                    <AlertTriangle
                      size={16}
                      className="text-[var(--amber)] mt-0.5 shrink-0"
                    />
                    <p className="text-sm text-[var(--text-secondary)]">
                      {intelError}
                    </p>
                  </div>
                )}

                {briefingSections && !intelLoading && (
                  <div className="space-y-5">
                    {briefingSections.powerStructure && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Crown size={13} className="text-[var(--gold)]" />
                          <span className="text-xs font-bold tracking-wider text-[var(--gold)]">
                            POWER STRUCTURE
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                          {briefingSections.powerStructure}
                        </p>
                      </div>
                    )}
                    {briefingSections.delegateDynamics && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp size={13} className="text-[var(--amber)]" />
                          <span className="text-xs font-bold tracking-wider text-[var(--amber)]">
                            DELEGATE DYNAMICS
                          </span>
                        </div>
                        <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                          {briefingSections.delegateDynamics
                            .split(/\n(?=\d\.|•|-)/)
                            .map((item, i) => (
                              <div
                                key={i}
                                className="mb-2 pl-3 border-l-2 border-[rgba(255,255,255,0.06)]"
                              >
                                {item.trim()}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    {briefingSections.hiddenRisks && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle size={13} className="text-[var(--red)]" />
                          <span className="text-xs font-bold tracking-wider text-[var(--red)]">
                            HIDDEN RISKS
                          </span>
                        </div>
                        <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                          {briefingSections.hiddenRisks
                            .split(/\n(?=\d\.|•|-)/)
                            .map((risk, i) => (
                              <div
                                key={i}
                                className="mb-2 pl-3 border-l-2 border-[rgba(239,68,68,0.2)]"
                              >
                                {risk.trim()}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    {briefingSections.strategicImplication && (
                      <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[rgba(212,175,55,0.15)]">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain size={13} className="text-[var(--gold)]" />
                          <span className="text-xs font-bold tracking-wider text-[var(--gold)]">
                            STRATEGIC IMPLICATION
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                          {briefingSections.strategicImplication}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {intelBriefing && !intelLoading && (
                  <PrecedentPulse precedent={intIntelPrecedent} entryId={intIntelEntryId} onOpenModal={setModalEntryId} />
                )}
              </div>
              <style jsx>{`
                @keyframes intelPulse {
                  0%, 100% { width: 20%; }
                  50% { width: 80%; }
                }
              `}</style>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CARD 1 — Delegate Dashboard */}
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-6">
          <h4 className="text-sm font-semibold mb-5 flex items-center gap-2">
            <Shield size={14} className="text-[var(--gold)]" />
            Delegate Dashboard
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="bg-[var(--bg-elevated)] rounded-xl p-4 text-center">
              <p className="text-xs text-[var(--text-muted)] mb-1">Total</p>
              <p className="text-2xl font-bold text-white">
                {data.totalDelegates || "\u2014"}
              </p>
            </div>
            <div className="bg-[var(--bg-elevated)] rounded-xl p-4 text-center">
              <p className="text-xs text-green-400 mb-1">Committed</p>
              <p className="text-2xl font-bold text-green-400">
                {data.committedDelegates || 0}
              </p>
            </div>
            <div className="bg-[var(--bg-elevated)] rounded-xl p-4 text-center">
              <p className="text-xs text-[var(--gold)] mb-1">Leaning</p>
              <p className="text-2xl font-bold text-[var(--gold)]">
                {data.leaningDelegates || 0}
              </p>
            </div>
            <div className="bg-[var(--bg-elevated)] rounded-xl p-4 text-center">
              <p className="text-xs text-red-400 mb-1">Hostile</p>
              <p className="text-2xl font-bold text-red-400">
                {data.hostileDelegates || 0}
              </p>
            </div>
          </div>

          {/* Win threshold bar */}
          {data.totalDelegates > 0 && (
            <div className="bg-[var(--bg-elevated)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--text-muted)]">
                  Path to Majority
                </span>
                <span className="text-xs font-bold" style={{ color: pathToWin ? "var(--green)" : "var(--amber)" }}>
                  {data.committedDelegates + data.leaningDelegates} / {winThreshold} needed
                </span>
              </div>
              <div className="w-full h-3 bg-[var(--bg-base)] rounded-full overflow-hidden relative">
                {/* Committed portion */}
                <div
                  className="absolute left-0 top-0 h-full bg-green-500 rounded-l-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (data.committedDelegates / data.totalDelegates) * 100)}%`,
                  }}
                />
                {/* Leaning portion */}
                <div
                  className="absolute top-0 h-full bg-[var(--gold)] transition-all duration-500"
                  style={{
                    left: `${(data.committedDelegates / data.totalDelegates) * 100}%`,
                    width: `${Math.min(100 - (data.committedDelegates / data.totalDelegates) * 100, (data.leaningDelegates / data.totalDelegates) * 100)}%`,
                  }}
                />
                {/* Win threshold line */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-white/60"
                  style={{
                    left: `${(winThreshold / data.totalDelegates) * 100}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-green-400">
                  {commitRate}% commit rate
                </span>
                {delegatesNeeded > 0 ? (
                  <span className="text-[10px] text-[var(--amber)]">
                    {delegatesNeeded} more delegates needed to win
                  </span>
                ) : (
                  <span className="text-[10px] text-green-400">
                    Above majority threshold
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Situation label */}
          {situationLabel && (
            <div className="bg-[var(--bg-elevated)] rounded-xl p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: situationColor }}
                />
                <span
                  className="text-xs font-bold tracking-wider"
                  style={{ color: situationColor }}
                >
                  POSITION: {situationLabel}
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {situationLabel === "COMMANDING" &&
                  `You control over 60% of committed delegates. The race is yours to lose. Focus on locking in leaners and preventing any last-minute defections. Do not get complacent — internal elections flip overnight.`}
                {situationLabel === "COMPETITIVE" &&
                  `Your committed + leaning delegates cross the majority threshold. The math works — but leaners are not votes. Convert them through direct cultivation. One broker flipping can reshape this race.`}
                {situationLabel === "CONTESTED" &&
                  `You have a base but not a majority. The uncommitted delegates are the battlefield. Every day without a personal touch on uncommitted delegates is a day your opponent is reaching them instead.`}
                {situationLabel === "UPHILL" &&
                  `Below 30% commit rate — you're behind. This requires a disruptive strategy: find the faction leader who can deliver a bloc, or surface an issue that reshuffles delegate loyalties entirely.`}
              </p>
            </div>
          )}
        </div>

        {/* CARD 2 — Contest Profile */}
        {(data.partyName || data.positionContested) && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-6">
            <h4 className="text-sm font-semibold mb-4">Contest Profile</h4>
            <div className="grid grid-cols-2 gap-4">
              {data.partyName && (
                <div className="bg-[var(--bg-elevated)] rounded-lg p-3">
                  <p className="text-xs text-[var(--text-muted)]">Party</p>
                  <p className="text-sm font-medium text-white">{data.partyName}</p>
                </div>
              )}
              {data.positionContested && (
                <div className="bg-[var(--bg-elevated)] rounded-lg p-3">
                  <p className="text-xs text-[var(--text-muted)]">Position</p>
                  <p className="text-sm font-medium text-white">{data.positionContested}</p>
                </div>
              )}
              {data.electionLevel && (
                <div className="bg-[var(--bg-elevated)] rounded-lg p-3">
                  <p className="text-xs text-[var(--text-muted)]">Level</p>
                  <p className="text-sm font-medium text-white">{data.electionLevel}</p>
                </div>
              )}
              {data.numberOfContestants && (
                <div className="bg-[var(--bg-elevated)] rounded-lg p-3">
                  <p className="text-xs text-[var(--text-muted)]">Contestants</p>
                  <p className="text-sm font-medium text-white">{data.numberOfContestants}-cornered</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CARD 3 — AI Internal Assessment */}
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--gold)]" />
          <div className="pl-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-[var(--gold)]" />
              <span className="text-xs font-bold text-[var(--gold)] tracking-wider">
                AI INTELLIGENCE
              </span>
            </div>

            {aiLoading ? (
              <div className="flex items-center gap-3 py-4">
                <div className="w-4 h-4 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[var(--text-secondary)]">
                  Analysing internal contest dynamics...
                </span>
              </div>
            ) : aiAssessment ? (
              <>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {aiAssessment}
                </p>
                <PrecedentPulse precedent={intPrecedent} entryId={intEntryId} onOpenModal={setModalEntryId} />
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                Fill in your party name, position, total delegates, status,
                and days remaining to activate the AI internal contest assessment.
              </p>
            )}
          </div>
        </div>
      </motion.div>
      <PrecedentModal entryId={modalEntryId} open={!!modalEntryId} onClose={() => setModalEntryId(null)} />
    </div>
  );
}
