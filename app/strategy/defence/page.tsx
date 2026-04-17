"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Shield,
  AlertTriangle,
  Zap,
  Swords,
  Activity,
  Clock,
  Copy,
  Check,
  Loader2,
  Trash2,
  ArrowLeft,
  BookOpen,
} from "lucide-react";

import {
  WarRoomData,
  OpponentMove,
  NarrativeThreat,
  Severity,
  Reach,
  PerceptionMomentum,
  StrategyAdherence,
  OpponentStrength,
  defaultWarRoomData,
} from "@/lib/warroom/types";
import {
  loadWarRoomData,
  saveWarRoomData,
  clearWarRoomData,
} from "@/lib/warroom/persistence";
import {
  computeSpiderData,
  compositeHealth,
  weakestAxis,
  computeDaysToGap,
} from "@/lib/warroom/scoring";
import {
  axisLabels,
  moveCategories,
  THREAT_TYPES,
  THREAT_PLATFORMS,
} from "@/lib/warroom/labels";
import RadarChart from "@/components/warroom/RadarChart";

type AIResponseOption = { text: string; useWhen: string };
type AIThreeResponses = {
  firm: AIResponseOption;
  pivot: AIResponseOption;
  elevate: AIResponseOption;
};

const RED = "#C0392B";
const RED_DIM = "rgba(192, 57, 43, 0.12)";
const RED_BORDER = "rgba(192, 57, 43, 0.35)";

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysBetween(fromISO: string): number {
  if (!fromISO) return 0;
  const target = new Date(fromISO).getTime();
  if (isNaN(target)) return 0;
  const diff = target - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

function healthColor(score: number): string {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

function WarRoomContent() {
  const searchParams = useSearchParams();
  const electionType = searchParams.get("election_type") || undefined;
  const isInternal = electionType === "internal";

  const [warRoom, setWarRoom] = useState<WarRoomData>(defaultWarRoomData);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount; merge URL params on first load
  useEffect(() => {
    const loaded = loadWarRoomData();
    const urlInit: Partial<WarRoomData> = {};

    const nameParam = searchParams.get("candidate_name");
    const constituencyParam = searchParams.get("constituency");
    const pollingDateParam = searchParams.get("polling_date");
    const voteGapParam = searchParams.get("vote_gap");
    const daysRemainingParam = searchParams.get("days_remaining");
    const dailyTargetParam = searchParams.get("daily_target");
    const opponentStrengthParam = searchParams.get("opponent_strength");
    const totalDistrictsParam = searchParams.get("total_districts");

    if (nameParam && !loaded.candidateName) urlInit.candidateName = nameParam;
    if (constituencyParam && !loaded.constituency) urlInit.constituency = constituencyParam;
    if (pollingDateParam && !loaded.pollingDate) urlInit.pollingDate = pollingDateParam;
    if (voteGapParam && !loaded.voteGap) urlInit.voteGap = parseInt(voteGapParam, 10) || 0;
    if (daysRemainingParam && !loaded.daysRemaining)
      urlInit.daysRemaining = parseInt(daysRemainingParam, 10) || 0;
    if (dailyTargetParam && !loaded.dailyTarget)
      urlInit.dailyTarget = parseInt(dailyTargetParam, 10) || 0;
    if (totalDistrictsParam && !loaded.totalDistricts)
      urlInit.totalDistricts = parseInt(totalDistrictsParam, 10) || 0;
    if (opponentStrengthParam && !loaded.opponentStrength) {
      const v = opponentStrengthParam.toLowerCase();
      if (v === "weak" || v === "moderate" || v === "strong") {
        urlInit.opponentStrength = v as OpponentStrength;
      }
    }

    const merged = { ...loaded, ...urlInit };
    setWarRoom(merged);
    if (Object.keys(urlInit).length > 0) saveWarRoomData(merged);
    setHydrated(true);
  }, [searchParams]);

  const updateWarRoom = useCallback((updates: Partial<WarRoomData>) => {
    setWarRoom((prev) => {
      const next = { ...prev, ...updates };
      saveWarRoomData(next);
      return next;
    });
  }, []);

  // Derived values
  const spider = useMemo(() => computeSpiderData(warRoom), [warRoom]);
  const health = useMemo(() => compositeHealth(spider.candidate), [spider]);
  const daysToPolling = useMemo(
    () => (warRoom.pollingDate ? daysBetween(warRoom.pollingDate) : warRoom.daysRemaining),
    [warRoom.pollingDate, warRoom.daysRemaining]
  );
  const labels = axisLabels(isInternal);
  const weakest = useMemo(() => weakestAxis(spider.candidate), [spider]);
  const daysToGap = useMemo(() => computeDaysToGap(warRoom), [warRoom]);

  // AI: Strategic Assessment (header)
  const [healthAssessment, setHealthAssessment] = useState<string | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const healthTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (healthTimer.current) clearTimeout(healthTimer.current);
    healthTimer.current = setTimeout(async () => {
      setHealthLoading(true);
      try {
        const res = await fetch("/api/strategy/defence/health", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateName: warRoom.candidateName,
            constituency: warRoom.constituency,
            daysRemaining: daysToPolling,
            compositeHealth: health,
            scores: spider.candidate,
            electionType: isInternal ? "internal" : "public",
          }),
        });
        const data = await res.json();
        if (data.assessment) setHealthAssessment(data.assessment);
      } catch (e) {
        console.error(e);
      } finally {
        setHealthLoading(false);
      }
    }, 2000);
    return () => {
      if (healthTimer.current) clearTimeout(healthTimer.current);
    };
  }, [hydrated, health, daysToPolling, warRoom.candidateName, warRoom.constituency, spider.candidate, isInternal]);

  // AI: Weakest axis diagnosis (debounced 1500ms)
  const [axisDiagnosis, setAxisDiagnosis] = useState<string | null>(null);
  const [axisLoading, setAxisLoading] = useState(false);
  const axisTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (axisTimer.current) clearTimeout(axisTimer.current);
    axisTimer.current = setTimeout(async () => {
      setAxisLoading(true);
      try {
        const res = await fetch("/api/strategy/defence/axis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            weakestAxis: labels[weakest.key],
            weakestScore: weakest.score,
            allScores: spider.candidate,
            daysRemaining: daysToPolling,
            electionType: isInternal ? "internal" : "public",
          }),
        });
        const data = await res.json();
        if (data.diagnosis) setAxisDiagnosis(data.diagnosis);
      } catch (e) {
        console.error(e);
      } finally {
        setAxisLoading(false);
      }
    }, 1500);
    return () => {
      if (axisTimer.current) clearTimeout(axisTimer.current);
    };
  }, [hydrated, weakest.key, weakest.score, spider.candidate, daysToPolling, labels, isInternal]);

  // AI: Priority action (debounced 2000ms) — fires when scorecards change and any is below threshold
  const [priorityAction, setPriorityAction] = useState<string | null>(null);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const priorityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scorecardBelowThreshold = useMemo(() => {
    const { scorecards } = warRoom;
    const numbersBehind = warRoom.dailyTarget > 0 && scorecards.contactsToday < warRoom.dailyTarget;
    const mobContracting =
      scorecards.districtsCoveredLastWeek > 0 &&
      scorecards.districtsCoveredThisWeek < scorecards.districtsCoveredLastWeek;
    const perceptionBad =
      scorecards.perceptionMomentum === "negative" ||
      scorecards.perceptionMomentum === "deteriorating";
    const daysToGapBad = daysToGap && daysToGap.status !== "on-track";
    const drifting = scorecards.strategyAdherence === "drifting";
    return Boolean(numbersBehind || mobContracting || perceptionBad || daysToGapBad || drifting);
  }, [warRoom, daysToGap]);

  useEffect(() => {
    if (!hydrated) return;
    if (!scorecardBelowThreshold) {
      setPriorityAction(null);
      return;
    }
    if (priorityTimer.current) clearTimeout(priorityTimer.current);
    priorityTimer.current = setTimeout(async () => {
      setPriorityLoading(true);
      try {
        const { scorecards } = warRoom;
        const numbersTrajectoryLabel =
          warRoom.dailyTarget > 0
            ? scorecards.contactsToday >= warRoom.dailyTarget
              ? "ON TRACK"
              : scorecards.contactsToday >= warRoom.dailyTarget * 0.7
                ? "BEHIND"
                : "CRITICAL"
            : "UNKNOWN";
        const mobLabel =
          scorecards.districtsCoveredLastWeek === 0
            ? "UNKNOWN"
            : scorecards.districtsCoveredThisWeek > scorecards.districtsCoveredLastWeek
              ? "EXPANDING"
              : scorecards.districtsCoveredThisWeek === scorecards.districtsCoveredLastWeek
                ? "STABLE"
                : "CONTRACTING";
        const res = await fetch("/api/strategy/defence/priority", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            numbersTrajectory: `${numbersTrajectoryLabel} (today ${scorecards.contactsToday} / target ${warRoom.dailyTarget || "n/a"})`,
            mobilisationVelocity: `${mobLabel} (this week ${scorecards.districtsCoveredThisWeek} vs last ${scorecards.districtsCoveredLastWeek})`,
            perceptionMomentum: scorecards.perceptionMomentum.toUpperCase(),
            daysToGap: daysToGap ? daysToGap.statusLine : "UNKNOWN",
            strategyAdherence: scorecards.strategyAdherence.toUpperCase(),
            daysRemaining: daysToPolling,
            electionType: isInternal ? "internal" : "public",
          }),
        });
        const data = await res.json();
        if (data.action) setPriorityAction(data.action);
      } catch (e) {
        console.error(e);
      } finally {
        setPriorityLoading(false);
      }
    }, 2000);
    return () => {
      if (priorityTimer.current) clearTimeout(priorityTimer.current);
    };
  }, [hydrated, scorecardBelowThreshold, warRoom, daysToGap, daysToPolling, isInternal]);

  // Opponent move form
  const [moveCategory, setMoveCategory] = useState("");
  const [moveSeverity, setMoveSeverity] = useState<Severity>("significant");
  const [moveDistrict, setMoveDistrict] = useState("");
  const [moveDetails, setMoveDetails] = useState("");
  const [moveLoading, setMoveLoading] = useState(false);

  async function logOpponentMove() {
    if (!moveCategory) return;
    const id = genId();
    const newMove: OpponentMove = {
      id,
      category: moveCategory,
      severity: moveSeverity,
      district: moveDistrict || undefined,
      details: moveDetails || undefined,
      loggedAt: new Date().toISOString(),
    };
    updateWarRoom({ opponentMoves: [newMove, ...warRoom.opponentMoves] });
    setMoveCategory("");
    setMoveDistrict("");
    setMoveDetails("");
    setMoveLoading(true);
    try {
      const res = await fetch("/api/strategy/defence/gametree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newMove.category,
          severity: newMove.severity,
          district: newMove.district,
          details: newMove.details,
          electionType: isInternal ? "internal" : "public",
          candidatePosition: `Ground ${spider.candidate.ground}, Numbers ${spider.candidate.numbers}, Narrative ${spider.candidate.narrative}`,
        }),
      });
      const data = await res.json();
      if (data.gameResponse) {
        setWarRoom((prev) => {
          const updated = prev.opponentMoves.map((m) =>
            m.id === id ? { ...m, aiResponse: data.gameResponse } : m
          );
          const next = { ...prev, opponentMoves: updated };
          saveWarRoomData(next);
          return next;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMoveLoading(false);
    }
  }

  function deleteMove(id: string) {
    updateWarRoom({
      opponentMoves: warRoom.opponentMoves.filter((m) => m.id !== id),
    });
  }

  // Threat form
  const [threatType, setThreatType] = useState("");
  const [threatPlatform, setThreatPlatform] = useState("");
  const [threatReach, setThreatReach] = useState<Reach>("growing");

  function logThreat() {
    if (!threatType || !threatPlatform) return;
    const newThreat: NarrativeThreat = {
      id: genId(),
      type: threatType,
      platform: threatPlatform,
      reach: threatReach,
      loggedAt: new Date().toISOString(),
    };
    updateWarRoom({ narrativeThreats: [newThreat, ...warRoom.narrativeThreats] });
    setThreatType("");
    setThreatPlatform("");
  }

  function deleteThreat(id: string) {
    updateWarRoom({
      narrativeThreats: warRoom.narrativeThreats.filter((t) => t.id !== id),
    });
  }

  const [inoculationLoadingId, setInoculationLoadingId] = useState<string | null>(null);
  async function generateInoculation(threat: NarrativeThreat) {
    setInoculationLoadingId(threat.id);
    try {
      const res = await fetch("/api/strategy/defence/inoculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threatType: threat.type,
          platform: threat.platform,
          reach: threat.reach,
          electionType: isInternal ? "internal" : "public",
        }),
      });
      const data = await res.json();
      if (data.inoculation) {
        setWarRoom((prev) => {
          const updated = prev.narrativeThreats.map((t) =>
            t.id === threat.id ? { ...t, inoculationStatement: data.inoculation } : t
          );
          const next = { ...prev, narrativeThreats: updated };
          saveWarRoomData(next);
          return next;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInoculationLoadingId(null);
    }
  }

  // Rapid response engine
  const [attackText, setAttackText] = useState("");
  const [attackSeverity, setAttackSeverity] = useState<Severity>("significant");
  const [responses, setResponses] = useState<AIThreeResponses | null>(null);
  const [responseLoading, setResponseLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function generateResponses() {
    if (!attackText.trim()) return;
    setResponseLoading(true);
    setResponses(null);
    try {
      const res = await fetch("/api/strategy/defence/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attackDescription: attackText,
          severity: attackSeverity,
          electionType: isInternal ? "internal" : "public",
        }),
      });
      const data = await res.json();
      if (data.responses) setResponses(data.responses);
    } catch (e) {
      console.error(e);
    } finally {
      setResponseLoading(false);
    }
  }

  function copyToClipboard(key: string, text: string) {
    if (typeof navigator === "undefined") return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  // Pre-populate response engine from an opponent move
  function generateResponseFromMove(move: OpponentMove) {
    const text = move.details
      ? `${move.category} — ${move.details}`
      : move.category;
    setAttackText(text);
    setAttackSeverity(move.severity);
    const el = document.getElementById("rapid-response-engine");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function generateResponseFromThreat(threat: NarrativeThreat) {
    setAttackText(`${threat.type} — spreading via ${threat.platform} (reach: ${threat.reach})`);
    setAttackSeverity(threat.reach === "viral" ? "critical" : threat.reach === "growing" ? "significant" : "minor");
    const el = document.getElementById("rapid-response-engine");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-[var(--gold)] text-sm flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" />
          Loading war room...
        </div>
      </div>
    );
  }

  const movesList = warRoom.opponentMoves;
  const threatsList = warRoom.narrativeThreats;
  const moveCats = moveCategories(isInternal);
  const daysLabel = isInternal ? "Days to election" : "Days to polling day";

  // Scorecard helpers
  const sc = warRoom.scorecards;
  const numbersStatus =
    warRoom.dailyTarget > 0
      ? sc.contactsToday >= warRoom.dailyTarget
        ? { label: "ON TRACK", color: "#22C55E" }
        : sc.contactsToday >= warRoom.dailyTarget * 0.7
          ? { label: "BEHIND", color: "#F59E0B" }
          : { label: "CRITICAL", color: RED }
      : { label: "NO TARGET", color: "#6B7280" };

  const mobStatus =
    sc.districtsCoveredLastWeek === 0
      ? { label: "NO DATA", color: "#6B7280" }
      : sc.districtsCoveredThisWeek > sc.districtsCoveredLastWeek
        ? { label: "EXPANDING", color: "#22C55E" }
        : sc.districtsCoveredThisWeek === sc.districtsCoveredLastWeek
          ? { label: "STABLE", color: "#F59E0B" }
          : { label: "CONTRACTING", color: RED };

  const perceptionColor: Record<PerceptionMomentum, string> = {
    positive: "#22C55E",
    neutral: "#6B7280",
    negative: "#F59E0B",
    deteriorating: RED,
  };
  const adherenceColor: Record<StrategyAdherence, string> = {
    executing: "#22C55E",
    drifting: "#F59E0B",
    pivoting: "#F5A623",
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          href={`/strategy/perceptions${electionType ? `?election_type=${electionType}` : ""}`}
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          <span>Back to Managing Perceptions</span>
        </Link>

        {/* COMPONENT 1 — WAR ROOM HEADER */}
        <div
          className="rounded-2xl p-8 mb-8"
          style={{
            background: "#1A0A0A",
            border: `1px solid ${RED_BORDER}`,
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
                style={{ background: RED_DIM, border: `1px solid ${RED_BORDER}` }}
              >
                <Shield size={12} style={{ color: RED }} />
                <span
                  className="text-[10px] font-bold tracking-[0.2em]"
                  style={{ color: RED }}
                >
                  LIVE OPERATIONS
                </span>
              </div>
              <h1
                className="text-4xl md:text-5xl font-bold tracking-[0.08em] text-[var(--gold)]"
                style={{ letterSpacing: "0.08em" }}
              >
                THE WAR ROOM
              </h1>
              <p className="text-[var(--text-secondary)] mt-2 text-sm">
                Your strategy is built. Now defend it.
              </p>
              <div className="mt-4 flex items-center gap-3 text-sm">
                <span className="text-white font-medium">
                  {warRoom.candidateName || "Candidate"}
                </span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="text-[var(--text-secondary)]">
                  {warRoom.constituency || "Constituency"}
                </span>
                <span className="text-[var(--text-muted)]">·</span>
                <span className="text-[var(--text-muted)] text-xs">
                  As of {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider text-[#22C55E]">
                  CAMPAIGN ACTIVE
                </span>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-4">
              <div>
                <div className="text-xs text-[var(--text-muted)] mb-1">
                  {daysLabel}
                </div>
                <div className="text-4xl font-bold text-white">
                  {daysToPolling}
                </div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)] mb-1">
                  Campaign health
                </div>
                <div className="text-3xl font-bold" style={{ color: healthColor(health) }}>
                  {health}
                  <span className="text-base text-[var(--text-muted)]">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Strategic Assessment */}
          <div className="mt-6 pt-6 border-t border-[rgba(192,57,43,0.2)]">
            <div className="text-[10px] font-bold tracking-wider mb-2" style={{ color: RED }}>
              STRATEGIC ASSESSMENT
            </div>
            <div className="text-sm text-[var(--text-secondary)] min-h-[1.5em]">
              {healthLoading ? (
                <span className="inline-flex items-center gap-2 text-[var(--text-muted)]">
                  <Loader2 size={12} className="animate-spin" />
                  Assessing position...
                </span>
              ) : (
                healthAssessment || "Update war room inputs to generate a calibrated assessment."
              )}
            </div>
          </div>
        </div>

        {/* Campaign context panel — set candidate / constituency / polling date / opponent strength */}
        <div className="rounded-xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] p-6 mb-8">
          <div className="text-[10px] font-bold tracking-wider text-[var(--gold)] mb-4">
            CAMPAIGN CONTEXT
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <LabeledText
              label="Candidate name"
              value={warRoom.candidateName}
              onChange={(v) => updateWarRoom({ candidateName: v })}
            />
            <LabeledText
              label="Constituency"
              value={warRoom.constituency}
              onChange={(v) => updateWarRoom({ constituency: v })}
            />
            <LabeledText
              label="Polling date"
              value={warRoom.pollingDate}
              onChange={(v) => updateWarRoom({ pollingDate: v })}
              type="date"
            />
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">
                Opponent strength
              </label>
              <select
                value={warRoom.opponentStrength}
                onChange={(e) =>
                  updateWarRoom({ opponentStrength: e.target.value as OpponentStrength })
                }
                className="w-full px-3 py-2 rounded bg-[var(--bg-base)] border border-[rgba(255,255,255,0.08)] text-sm text-white"
              >
                <option value="weak">Weak</option>
                <option value="moderate">Moderate</option>
                <option value="strong">Strong</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <LabeledNumber
              label="Vote gap (from F3)"
              value={warRoom.voteGap}
              onChange={(v) => updateWarRoom({ voteGap: v })}
            />
            <LabeledNumber
              label="Days remaining (from F3)"
              value={warRoom.daysRemaining}
              onChange={(v) => updateWarRoom({ daysRemaining: v })}
            />
            <LabeledNumber
              label="Daily target (from F3)"
              value={warRoom.dailyTarget}
              onChange={(v) => updateWarRoom({ dailyTarget: v })}
            />
            <LabeledNumber
              label="Active branches"
              value={warRoom.branchesActive}
              onChange={(v) => updateWarRoom({ branchesActive: v })}
            />
          </div>
        </div>

        {/* COMPONENT 2 — BATTLEFIELD POSITION SPIDER CHART */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={18} className="text-[var(--gold)]" />
            <h2 className="text-xl font-bold tracking-wide">BATTLEFIELD POSITION</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Gold is your campaign. Red is the estimated opponent position.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
              <RadarChart
                candidate={spider.candidate}
                opponent={spider.opponent}
                labels={labels}
              />
              <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--gold)]" />
                  <span className="text-[var(--text-secondary)]">Your campaign</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: RED }} />
                  <span className="text-[var(--text-secondary)]">Est. opponent</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
              <div className="text-[10px] font-bold tracking-wider text-[var(--gold)] mb-4">
                WAR ROOM INPUTS — UPDATE DAILY
              </div>

              <AxisInputGroup label="Ground">
                <LabeledNumber
                  label="Polling districts active"
                  value={warRoom.districtsActive}
                  onChange={(v) => updateWarRoom({ districtsActive: v })}
                  compact
                />
                <LabeledNumber
                  label="Total districts"
                  value={warRoom.totalDistricts}
                  onChange={(v) => updateWarRoom({ totalDistricts: v })}
                  compact
                />
              </AxisInputGroup>

              <AxisInputGroup label="Numbers">
                <LabeledNumber
                  label="Total contacts logged"
                  value={warRoom.totalContactsLogged}
                  onChange={(v) => updateWarRoom({ totalContactsLogged: v })}
                  compact
                />
                <LabeledNumber
                  label="Days elapsed"
                  value={warRoom.daysElapsed}
                  onChange={(v) => updateWarRoom({ daysElapsed: v })}
                  compact
                />
              </AxisInputGroup>

              <AxisInputGroup label="Narrative">
                <LabeledCheckbox
                  label="Voter archetype complete (F2)"
                  checked={warRoom.archetypeComplete}
                  onChange={(v) => updateWarRoom({ archetypeComplete: v })}
                />
                <LabeledCheckbox
                  label="Manifesto intelligence complete (F2)"
                  checked={warRoom.manifestoComplete}
                  onChange={(v) => updateWarRoom({ manifestoComplete: v })}
                />
                <LabeledNumber
                  label="Brand phases complete (0-5)"
                  value={warRoom.brandPhasesComplete}
                  onChange={(v) => updateWarRoom({ brandPhasesComplete: Math.min(5, Math.max(0, v)) })}
                  compact
                />
                <LabeledNumber
                  label="Defense claims (0-5)"
                  value={warRoom.defenseClaimsComplete}
                  onChange={(v) => updateWarRoom({ defenseClaimsComplete: Math.min(5, Math.max(0, v)) })}
                  compact
                />
              </AxisInputGroup>

              <AxisInputGroup label="Organisation">
                <LabeledNumber
                  label="Active volunteers"
                  value={warRoom.activeVolunteers}
                  onChange={(v) => updateWarRoom({ activeVolunteers: v })}
                  compact
                />
                <LabeledNumber
                  label="Community endorsements"
                  value={warRoom.endorsementsSecured}
                  onChange={(v) => updateWarRoom({ endorsementsSecured: v })}
                  compact
                />
              </AxisInputGroup>

              <AxisInputGroup label="Momentum">
                <LabeledNumber
                  label="Contacts this week"
                  value={warRoom.contactsThisWeek}
                  onChange={(v) => updateWarRoom({ contactsThisWeek: v })}
                  compact
                />
                <LabeledNumber
                  label="Contacts previous week"
                  value={warRoom.contactsPreviousWeek}
                  onChange={(v) => updateWarRoom({ contactsPreviousWeek: v })}
                  compact
                />
                <div className="text-[10px] text-[var(--text-muted)] col-span-2">
                  Opponent moves & threats this week are counted automatically from the logs below.
                </div>
              </AxisInputGroup>

              <AxisInputGroup label="Resources" isLast>
                <LabeledNumber
                  label="Budget remaining (RM)"
                  value={warRoom.budgetRemaining}
                  onChange={(v) => updateWarRoom({ budgetRemaining: v })}
                  compact
                />
                <LabeledNumber
                  label="Daily cost (RM)"
                  value={warRoom.dailyCampaignCost}
                  onChange={(v) => updateWarRoom({ dailyCampaignCost: v })}
                  compact
                />
              </AxisInputGroup>
            </div>
          </div>

          {/* Weakest-axis diagnosis */}
          <div
            className="mt-6 rounded-xl p-5"
            style={{
              background: "rgba(245, 166, 35, 0.05)",
              border: "1px solid rgba(245, 166, 35, 0.25)",
            }}
          >
            <div className="text-[10px] font-bold tracking-wider text-[var(--gold)] mb-2">
              WEAKEST AXIS DIAGNOSIS
            </div>
            <div className="text-sm text-[var(--text-primary)] min-h-[1.5em]">
              {axisLoading ? (
                <span className="inline-flex items-center gap-2 text-[var(--text-muted)]">
                  <Loader2 size={12} className="animate-spin" />
                  Analysing...
                </span>
              ) : (
                axisDiagnosis ||
                `Your most critical gap is ${labels[weakest.key]} at ${Math.round(weakest.score)}/100. Update war room inputs to generate a calibrated prescription.`
              )}
            </div>
          </div>
        </section>

        {/* COMPONENT 3 — OPPONENT INTELLIGENCE */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Swords size={18} style={{ color: RED }} />
            <h2 className="text-xl font-bold tracking-wide">OPPONENT INTELLIGENCE</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Track what your opponent is doing. Update when you observe moves in the field.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
              <div className="text-[10px] font-bold tracking-wider text-[var(--gold)] mb-4">
                LOG AN OPPONENT MOVE
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">
                    Move category
                  </label>
                  <select
                    value={moveCategory}
                    onChange={(e) => setMoveCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[var(--bg-base)] border border-[rgba(255,255,255,0.08)] text-sm text-white"
                  >
                    <option value="">Select a category...</option>
                    {moveCats.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-2">
                    Severity
                  </label>
                  <div className="space-y-1">
                    {(
                      [
                        { v: "minor" as const, l: "Minor — noise, not signal" },
                        { v: "significant" as const, l: "Significant — requires monitoring" },
                        { v: "critical" as const, l: "Critical — requires immediate response" },
                      ]
                    ).map((opt) => (
                      <label
                        key={opt.v}
                        className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="move-severity"
                          value={opt.v}
                          checked={moveSeverity === opt.v}
                          onChange={() => setMoveSeverity(opt.v)}
                          className="accent-[var(--gold)]"
                        />
                        {opt.l}
                      </label>
                    ))}
                  </div>
                </div>

                <LabeledText
                  label={isInternal ? "Division affected (optional)" : "District affected (optional)"}
                  value={moveDistrict}
                  onChange={setMoveDistrict}
                  placeholder={isInternal ? "e.g. Division 3" : "e.g. Polling districts 7 and 12"}
                />

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">
                    Details (optional)
                  </label>
                  <textarea
                    value={moveDetails}
                    onChange={(e) => setMoveDetails(e.target.value)}
                    placeholder="What happened, when, what you observed..."
                    rows={3}
                    className="w-full px-3 py-2 rounded bg-[var(--bg-base)] border border-[rgba(255,255,255,0.08)] text-sm text-white placeholder-[var(--text-muted)]"
                  />
                </div>

                <button
                  onClick={logOpponentMove}
                  disabled={!moveCategory || moveLoading}
                  className="w-full px-4 py-3 rounded-lg font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "var(--gold-dim)",
                    border: "1px solid var(--gold-border)",
                    color: "var(--gold)",
                  }}
                >
                  {moveLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" />
                      Logging & analysing...
                    </span>
                  ) : (
                    "Log This Move →"
                  )}
                </button>
              </div>
            </div>

            <div className="lg:col-span-3 bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
              <div className="text-[10px] font-bold tracking-wider text-[var(--gold)] mb-4">
                MOVE LOG ({movesList.length})
              </div>
              {movesList.length === 0 ? (
                <div className="text-sm text-[var(--text-muted)] italic">
                  No opponent moves logged yet. When you observe a move in the field, log it here.
                </div>
              ) : (
                <div className="space-y-4">
                  {movesList.map((move) => (
                    <div
                      key={move.id}
                      className="rounded-lg bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] p-4"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-white">
                            {move.category}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <SeverityBadge severity={move.severity} />
                            {move.district && (
                              <span className="text-[var(--text-secondary)]">
                                {move.district}
                              </span>
                            )}
                            <span className="text-[var(--text-muted)] inline-flex items-center gap-1">
                              <Clock size={10} />
                              {formatWhen(move.loggedAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => generateResponseFromMove(move)}
                            className="text-xs text-[var(--gold)] hover:underline"
                          >
                            Generate Response →
                          </button>
                          <button
                            onClick={() => deleteMove(move.id)}
                            className="text-[var(--text-muted)] hover:text-[var(--red)]"
                            aria-label="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      {move.details && (
                        <div className="text-xs text-[var(--text-secondary)] mb-3">
                          {move.details}
                        </div>
                      )}
                      {move.aiResponse && (
                        <div
                          className="mt-3 rounded-lg p-3"
                          style={{
                            background: "rgba(245, 166, 35, 0.05)",
                            border: "1px solid rgba(245, 166, 35, 0.3)",
                          }}
                        >
                          <div className="text-[9px] font-bold tracking-wider text-[var(--gold)] mb-1">
                            GAME THEORY RESPONSE
                          </div>
                          <div className="text-xs text-[var(--text-primary)] leading-relaxed">
                            {move.aiResponse}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* COMPONENT 4 — NARRATIVE THREATS */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={18} style={{ color: RED }} />
            <h2 className="text-xl font-bold tracking-wide">NARRATIVE THREATS</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Track negative narratives circulating about you. The earlier you log them, the more effective your response.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
              <div className="text-[10px] font-bold tracking-wider text-[var(--gold)] mb-4">
                ADD A THREAT
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">
                    Narrative type
                  </label>
                  <select
                    value={threatType}
                    onChange={(e) => setThreatType(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[var(--bg-base)] border border-[rgba(255,255,255,0.08)] text-sm text-white"
                  >
                    <option value="">Select type...</option>
                    {THREAT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">
                    Platform circulating
                  </label>
                  <select
                    value={threatPlatform}
                    onChange={(e) => setThreatPlatform(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[var(--bg-base)] border border-[rgba(255,255,255,0.08)] text-sm text-white"
                  >
                    <option value="">Select platform...</option>
                    {THREAT_PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-2">
                    Estimated reach
                  </label>
                  <div className="space-y-1">
                    {(
                      [
                        { v: "contained" as const, l: "Contained — small group, not spreading" },
                        { v: "growing" as const, l: "Growing — visible spread across groups" },
                        { v: "viral" as const, l: "Viral — widespread, cannot be ignored" },
                      ]
                    ).map((opt) => (
                      <label
                        key={opt.v}
                        className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="threat-reach"
                          value={opt.v}
                          checked={threatReach === opt.v}
                          onChange={() => setThreatReach(opt.v)}
                          className="accent-[var(--gold)]"
                        />
                        {opt.l}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={logThreat}
                  disabled={!threatType || !threatPlatform}
                  className="w-full px-4 py-3 rounded-lg font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: RED_DIM,
                    border: `1px solid ${RED_BORDER}`,
                    color: RED,
                  }}
                >
                  Add Threat →
                </button>
              </div>
            </div>

            <div className="lg:col-span-3 bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
              <div className="text-[10px] font-bold tracking-wider text-[var(--gold)] mb-4">
                THREAT LOG ({threatsList.length})
              </div>
              {threatsList.length === 0 ? (
                <div className="text-sm text-[var(--text-muted)] italic">
                  No threats logged. When you spot a negative narrative circulating, add it here.
                </div>
              ) : (
                <div className="space-y-4">
                  {threatsList.map((threat) => (
                    <div
                      key={threat.id}
                      className="rounded-lg bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] p-4"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-white">
                            {threat.type}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <ReachBadge reach={threat.reach} />
                            <span className="text-[var(--text-secondary)]">
                              {threat.platform}
                            </span>
                            <span className="text-[var(--text-muted)] inline-flex items-center gap-1">
                              <Clock size={10} />
                              {formatWhen(threat.loggedAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => generateInoculation(threat)}
                            disabled={inoculationLoadingId === threat.id}
                            className="text-xs text-[var(--gold)] hover:underline disabled:opacity-50"
                          >
                            {inoculationLoadingId === threat.id ? (
                              <span className="inline-flex items-center gap-1">
                                <Loader2 size={10} className="animate-spin" />
                                Generating...
                              </span>
                            ) : (
                              "Generate Inoculation →"
                            )}
                          </button>
                          <button
                            onClick={() => generateResponseFromThreat(threat)}
                            className="text-xs text-[var(--gold)] hover:underline"
                          >
                            Generate Response →
                          </button>
                          <button
                            onClick={() => deleteThreat(threat.id)}
                            className="text-[var(--text-muted)] hover:text-[var(--red)]"
                            aria-label="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      {threat.inoculationStatement && (
                        <div
                          className="mt-3 rounded-lg p-3"
                          style={{
                            background: "rgba(245, 166, 35, 0.05)",
                            border: "1px solid rgba(245, 166, 35, 0.3)",
                          }}
                        >
                          <div className="text-[9px] font-bold tracking-wider text-[var(--gold)] mb-1">
                            INOCULATION STATEMENT
                          </div>
                          <div className="text-xs text-[var(--text-primary)] leading-relaxed mb-2">
                            {threat.inoculationStatement}
                          </div>
                          <div className="text-[9px] text-[var(--text-muted)] italic">
                            V.O. Key Jr. · Southern Politics · 1949 — Inoculation works best delivered before the attack, not as a reaction to it.
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* COMPONENT 5 — RAPID RESPONSE ENGINE */}
        <section className="mb-12" id="rapid-response-engine">
          <div className="flex items-center gap-3 mb-2">
            <Zap size={18} className="text-[var(--gold)]" />
            <h2 className="text-xl font-bold tracking-wide">RAPID RESPONSE ENGINE</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            An attack is live. Generate three response options in under 60 seconds.
          </p>

          <div className="bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
            <div className="mb-4">
              <label className="block text-xs text-[var(--text-muted)] mb-1">
                What is happening right now?
              </label>
              <textarea
                value={attackText}
                onChange={(e) => setAttackText(e.target.value)}
                placeholder="Describe the attack, the statement, or the event that requires immediate response..."
                rows={4}
                className="w-full px-3 py-2 rounded bg-[var(--bg-base)] border border-[rgba(255,255,255,0.08)] text-sm text-white placeholder-[var(--text-muted)]"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs text-[var(--text-muted)] mb-2">
                Severity
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {(
                  [
                    { v: "minor" as const, l: "Minor", sub: "Response within 24 hours" },
                    { v: "significant" as const, l: "Significant", sub: "Response within 6 hours" },
                    { v: "critical" as const, l: "Critical", sub: "Response within 1 hour" },
                  ]
                ).map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => setAttackSeverity(opt.v)}
                    className="text-left p-3 rounded-lg border transition-all"
                    style={{
                      background:
                        attackSeverity === opt.v
                          ? "var(--gold-dim)"
                          : "var(--bg-base)",
                      borderColor:
                        attackSeverity === opt.v
                          ? "var(--gold-border)"
                          : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="text-sm font-semibold text-white">{opt.l}</div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-1">
                      {opt.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateResponses}
              disabled={!attackText.trim() || responseLoading}
              className="w-full px-6 py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #F5A623, #E8961C)",
                color: "#1A0A0A",
              }}
            >
              {responseLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={12} className="animate-spin" />
                  Generating...
                </span>
              ) : (
                "Generate Responses →"
              )}
            </button>

            {responses && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {(
                  [
                    { key: "firm" as const, label: "FIRM", opt: responses.firm },
                    { key: "pivot" as const, label: "PIVOT", opt: responses.pivot },
                    { key: "elevate" as const, label: "ELEVATE", opt: responses.elevate },
                  ]
                ).map((r) => (
                  <div
                    key={r.key}
                    className="rounded-xl p-5 bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)]"
                  >
                    <div className="text-[10px] font-bold tracking-[0.2em] text-[var(--gold)] mb-3">
                      {r.label}
                    </div>
                    <p className="text-sm text-white leading-relaxed mb-4">
                      {r.opt.text}
                    </p>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
                      Use when
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mb-4">
                      {r.opt.useWhen}
                    </p>
                    <button
                      onClick={() => copyToClipboard(r.key, r.opt.text)}
                      className="inline-flex items-center gap-2 text-xs text-[var(--gold)] hover:underline"
                    >
                      {copied === r.key ? (
                        <>
                          <Check size={12} /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy →
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* COMPONENT 6 — CAMPAIGN HEALTH SCORECARDS */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={18} className="text-[var(--gold)]" />
            <h2 className="text-xl font-bold tracking-wide">CAMPAIGN HEALTH — DAILY METRICS</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            The five metrics that must be tracked every day. When any falls below threshold, respond immediately.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <ScorecardCard
              title="NUMBERS TRAJECTORY"
              question="Are voter contacts on pace?"
              statusLabel={numbersStatus.label}
              statusColor={numbersStatus.color}
            >
              <LabeledNumber
                label={`Contacts today (target ${warRoom.dailyTarget || "n/a"})`}
                value={sc.contactsToday}
                onChange={(v) =>
                  updateWarRoom({ scorecards: { ...sc, contactsToday: v } })
                }
                compact
              />
            </ScorecardCard>

            <ScorecardCard
              title="MOBILISATION VELOCITY"
              question="Is ground coverage expanding?"
              statusLabel={mobStatus.label}
              statusColor={mobStatus.color}
            >
              <LabeledNumber
                label="Districts this week"
                value={sc.districtsCoveredThisWeek}
                onChange={(v) =>
                  updateWarRoom({
                    scorecards: { ...sc, districtsCoveredThisWeek: v },
                  })
                }
                compact
              />
              <LabeledNumber
                label="Districts last week"
                value={sc.districtsCoveredLastWeek}
                onChange={(v) =>
                  updateWarRoom({
                    scorecards: { ...sc, districtsCoveredLastWeek: v },
                  })
                }
                compact
              />
            </ScorecardCard>

            <ScorecardCard
              title="PERCEPTION MOMENTUM"
              question="Is sentiment moving in the right direction?"
              statusLabel={sc.perceptionMomentum.toUpperCase()}
              statusColor={perceptionColor[sc.perceptionMomentum]}
            >
              <div className="space-y-1">
                {(["positive", "neutral", "negative", "deteriorating"] as PerceptionMomentum[]).map((v) => (
                  <label
                    key={v}
                    className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="perception-momentum"
                      value={v}
                      checked={sc.perceptionMomentum === v}
                      onChange={() =>
                        updateWarRoom({
                          scorecards: { ...sc, perceptionMomentum: v },
                        })
                      }
                      className="accent-[var(--gold)]"
                    />
                    {v[0].toUpperCase() + v.slice(1)}
                  </label>
                ))}
              </div>
            </ScorecardCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div
              className="rounded-xl p-5 border"
              style={{
                background: "var(--bg-surface)",
                borderColor:
                  daysToGap?.status === "critical"
                    ? RED_BORDER
                    : daysToGap?.status === "behind"
                      ? "rgba(245,166,35,0.3)"
                      : "rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-[10px] font-bold tracking-wider text-[var(--gold)]">
                    DAYS-TO-GAP RATIO
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    At current pace, will you close the vote gap before polling day?
                  </div>
                </div>
              </div>
              {daysToGap ? (
                <>
                  <div
                    className="text-sm font-semibold mb-3"
                    style={{
                      color:
                        daysToGap.status === "on-track"
                          ? "#22C55E"
                          : daysToGap.status === "behind"
                            ? "#F59E0B"
                            : RED,
                    }}
                  >
                    {daysToGap.statusLine}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] space-y-0.5">
                    <div>
                      Current daily rate: {daysToGap.currentDailyRate.toFixed(1)} contacts/day
                    </div>
                    <div>
                      Projected contacts by polling day:{" "}
                      {Math.round(daysToGap.projectedTotalContacts).toLocaleString()}
                    </div>
                    <div>
                      Estimated votes closed:{" "}
                      {Math.round(daysToGap.projectedVotesClosed).toLocaleString()}
                    </div>
                    <div>
                      Gap remaining: {Math.round(daysToGap.projectedShortfall).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] italic mt-3">
                    Assumes 70% contact-to-vote conversion. Adjust based on your canvassing quality.
                  </div>
                </>
              ) : (
                <div className="text-sm text-[var(--text-muted)] italic">
                  Set voteGap, daysRemaining, and contacts/days elapsed to compute.
                </div>
              )}
            </div>

            <ScorecardCard
              title="STRATEGY ADHERENCE"
              question="Are you executing what you planned?"
              statusLabel={sc.strategyAdherence.toUpperCase()}
              statusColor={adherenceColor[sc.strategyAdherence]}
            >
              <div className="space-y-1 mb-3">
                {(["executing", "drifting", "pivoting"] as StrategyAdherence[]).map((v) => (
                  <label
                    key={v}
                    className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="strategy-adherence"
                      value={v}
                      checked={sc.strategyAdherence === v}
                      onChange={() =>
                        updateWarRoom({
                          scorecards: { ...sc, strategyAdherence: v },
                        })
                      }
                      className="accent-[var(--gold)]"
                    />
                    {v[0].toUpperCase() + v.slice(1)}
                  </label>
                ))}
              </div>
              <LabeledText
                label="What changed? (optional)"
                value={sc.strategyNote}
                onChange={(v) =>
                  updateWarRoom({ scorecards: { ...sc, strategyNote: v } })
                }
              />
            </ScorecardCard>
          </div>

          {(priorityAction || priorityLoading) && (
            <div
              className="rounded-xl p-5"
              style={{
                background: RED_DIM,
                border: `1px solid ${RED_BORDER}`,
              }}
            >
              <div className="text-[10px] font-bold tracking-wider mb-2" style={{ color: RED }}>
                PRIORITY ACTION
              </div>
              <div className="text-sm text-white min-h-[1.5em]">
                {priorityLoading ? (
                  <span className="inline-flex items-center gap-2 text-[var(--text-muted)]">
                    <Loader2 size={12} className="animate-spin" />
                    Identifying priority...
                  </span>
                ) : (
                  priorityAction
                )}
              </div>
            </div>
          )}
        </section>

        {/* COMPONENT 7 — INTELLIGENCE ARCHIVE */}
        <section className="mb-12">
          <div
            className="rounded-xl p-6"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-[10px] font-bold tracking-wider text-[var(--gold)] mb-1">
                  HISTORICAL PRECEDENTS FOR CAMPAIGNS UNDER FIRE
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Three case studies to reference when the pressure rises.
                </p>
              </div>
              <Link
                href="/strategy/digest"
                className="inline-flex items-center gap-2 text-xs text-[var(--gold)] hover:underline whitespace-nowrap"
              >
                <BookOpen size={12} />
                Open Intelligence Library →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <PrecedentTile
                title="Syed Saddiq 2022"
                tag="Perception under fire"
                body="Muar, GE15. Held the seat amid a coordinated narrative attack by leaning into transparency and youth-forward positioning rather than responding issue-by-issue."
              />
              <PrecedentTile
                title="Reagan 1980"
                tag="Reframing under attack"
                body="'There you go again.' Rose above the specific charge, reframed the contest entirely, and took control of the narrative in a single sentence."
              />
              <PrecedentTile
                title="Alinsky — Power Projection"
                tag="Underdog playbook"
                body="Rules for Radicals: pick the target, freeze it, personalise it, polarise it. When you're outgunned, concentrate force where the opponent is weakest."
              />
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section className="mb-12">
          <div
            className="rounded-xl p-6"
            style={{
              background: "rgba(192,57,43,0.05)",
              border: "1px solid rgba(192,57,43,0.2)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold tracking-wider mb-1" style={{ color: RED }}>
                  DANGER ZONE
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Reset clears all war room inputs, logs, and scorecards permanently.
                </p>
              </div>
              <button
                onClick={() => {
                  if (
                    confirm(
                      "Clear all war room data? This cannot be undone."
                    )
                  ) {
                    clearWarRoomData();
                    setWarRoom(defaultWarRoomData);
                  }
                }}
                className="text-xs font-medium px-4 py-2 rounded border"
                style={{
                  color: RED,
                  borderColor: RED_BORDER,
                  background: RED_DIM,
                }}
              >
                Reset War Room
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ==== Reusable form bits ====

function LabeledText({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-[var(--text-muted)] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded bg-[var(--bg-base)] border border-[rgba(255,255,255,0.08)] text-sm text-white placeholder-[var(--text-muted)]"
      />
    </div>
  );
}

function LabeledNumber({
  label,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  compact?: boolean;
}) {
  return (
    <div>
      <label className={`block ${compact ? "text-[10px]" : "text-xs"} text-[var(--text-muted)] mb-1`}>
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? 0 : parseFloat(v) || 0);
        }}
        className={`w-full px-3 ${compact ? "py-1.5 text-xs" : "py-2 text-sm"} rounded bg-[var(--bg-base)] border border-[rgba(255,255,255,0.08)] text-white`}
      />
    </div>
  );
}

function LabeledCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer col-span-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[var(--gold)]"
      />
      {label}
    </label>
  );
}

function AxisInputGroup({
  label,
  children,
  isLast = false,
}: {
  label: string;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className={`${isLast ? "" : "mb-5 pb-5 border-b border-[rgba(255,255,255,0.04)]"}`}>
      <div className="text-[10px] font-bold tracking-wider text-[var(--text-secondary)] mb-2">
        {label.toUpperCase()}
      </div>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const conf: Record<Severity, { color: string; bg: string; label: string }> = {
    minor: { color: "#22C55E", bg: "rgba(34,197,94,0.15)", label: "MINOR" },
    significant: {
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.15)",
      label: "SIGNIFICANT",
    },
    critical: {
      color: "#C0392B",
      bg: "rgba(192,57,43,0.15)",
      label: "CRITICAL",
    },
  };
  const c = conf[severity];
  return (
    <span
      className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider"
      style={{ color: c.color, background: c.bg }}
    >
      {c.label}
    </span>
  );
}

function ReachBadge({ reach }: { reach: Reach }) {
  const conf: Record<Reach, { color: string; bg: string; label: string }> = {
    contained: {
      color: "#22C55E",
      bg: "rgba(34,197,94,0.15)",
      label: "CONTAINED",
    },
    growing: {
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.15)",
      label: "GROWING",
    },
    viral: { color: "#C0392B", bg: "rgba(192,57,43,0.15)", label: "VIRAL" },
  };
  const c = conf[reach];
  return (
    <span
      className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider"
      style={{ color: c.color, background: c.bg }}
    >
      {c.label}
    </span>
  );
}

function ScorecardCard({
  title,
  question,
  statusLabel,
  statusColor,
  children,
}: {
  title: string;
  question: string;
  statusLabel: string;
  statusColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[10px] font-bold tracking-wider text-[var(--gold)]">
            {title}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">{question}</div>
        </div>
        <span
          className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider"
          style={{ color: statusColor, background: `${statusColor}20` }}
        >
          {statusLabel}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PrecedentTile({
  title,
  tag,
  body,
}: {
  title: string;
  tag: string;
  body: string;
}) {
  return (
    <div className="rounded-lg bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] p-4">
      <div className="text-[9px] font-bold tracking-wider text-[var(--gold)] mb-1">
        {tag.toUpperCase()}
      </div>
      <div className="text-sm font-semibold text-white mb-2">{title}</div>
      <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
        {body}
      </div>
    </div>
  );
}

export default function ArtOfDefence() {
  return (
    <Suspense>
      <WarRoomContent />
    </Suspense>
  );
}
