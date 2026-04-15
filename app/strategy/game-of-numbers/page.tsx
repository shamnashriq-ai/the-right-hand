"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Users,
  Target,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Mail,
  Loader2,
  Copy,
  Check,
  Award,
} from "lucide-react";
import FrameworkNav from "@/components/FrameworkNav";
import PrecedentPulse from "@/components/intelligence/PrecedentPulse";
import PrecedentModal from "@/components/intelligence/PrecedentModal";

function formatNum(n: number): string {
  return n.toLocaleString();
}

function GameOfNumbersContent() {
  const searchParams = useSearchParams();
  const electionType = searchParams.get("election_type") || undefined;
  const isInternal = electionType === "internal";

  const prefilledVoters = searchParams.get("total_voters");
  const archetypeSummary = searchParams.get("archetype_summary") || "";
  const dominantEmotion = searchParams.get("dominant_emotion") || "";

  const [totalVoters, setTotalVoters] = useState(prefilledVoters ? parseInt(prefilledVoters) : 0);
  const [turnout, setTurnout] = useState(75);
  const [basePct, setBasePct] = useState(25);
  const [candidates, setCandidates] = useState(3);
  const [ambition, setAmbition] = useState<"survive" | "comfortable" | "dominate">("comfortable");
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [communityLeaders, setCommunityLeaders] = useState(0);
  const [postalVotes, setPostalVotes] = useState(0);
  const [scenarioOpen, setScenarioOpen] = useState(false);

  const [aiAssessment, setAiAssessment] = useState<string | null>(null);
  const [aiPrecedent, setAiPrecedent] = useState<string | null>(null);
  const [aiEntryId, setAiEntryId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [modalEntryId, setModalEntryId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Core calculations
  const votesCast = Math.round(totalVoters * (turnout / 100));

  const thresholdBase: Record<number, number> = { 2: 0.501, 3: 0.36, 4: 0.30, 5: 0.27 };
  const ambitionModifier: Record<string, number> = { survive: -0.01, comfortable: 0.02, dominate: 0.06 };

  const adjustedThreshold = (thresholdBase[candidates] ?? 0.36) + (ambitionModifier[ambition] ?? 0.02);
  const winTarget = Math.round(votesCast * adjustedThreshold);
  const baseVotes = Math.round(votesCast * (basePct / 100));
  const voteGap = Math.max(0, winTarget - baseVotes);
  const baseAsPercentOfTarget = winTarget > 0 ? Math.min(100, Math.round((baseVotes / winTarget) * 100)) : 0;

  const swingVotes = Math.round(voteGap * 0.57);
  const nonVoterVotes = Math.round(voteGap * 0.29);
  const switcherVotes = voteGap - swingVotes - nonVoterVotes;

  const dailyTarget = daysRemaining > 0 ? Math.ceil(voteGap / daysRemaining) : null;
  const oneInN = totalVoters > 0 && voteGap > 0 ? Math.round(totalVoters / voteGap) : null;

  // Scenario calculations
  const calcScenario = (t: number) => {
    const vc = Math.round(totalVoters * (t / 100));
    const wt = Math.round(vc * adjustedThreshold);
    const bv = Math.round(vc * (basePct / 100));
    const vg = Math.max(0, wt - bv);
    return { votesCast: vc, winTarget: wt, voteGap: vg };
  };
  const lowScenario = calcScenario(Math.max(50, turnout - 8));
  const highScenario = calcScenario(Math.min(95, turnout + 8));
  const turnoutSensitivity = Math.round((highScenario.winTarget - lowScenario.winTarget) / 2);

  // Daily target status
  const getDailyStatus = (dt: number | null) => {
    if (dt === null) return { label: "Enter days remaining", color: "var(--text-muted)", bg: "transparent" };
    if (dt <= 50) return { label: "ACHIEVABLE — strong position", color: "#22C55E", bg: "rgba(34,197,94,0.15)" };
    if (dt <= 150) return { label: "DEMANDING — requires disciplined daily execution", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" };
    if (dt <= 300) return { label: "INTENSIVE — needs expanded volunteer base immediately", color: "#F97316", bg: "rgba(249,115,22,0.15)" };
    return { label: "CRITICAL — current pace requires urgent machinery expansion", color: "#EF4444", bg: "rgba(239,68,68,0.15)" };
  };
  const dailyStatus = getDailyStatus(dailyTarget);

  const ambitionLabels: Record<string, string> = {
    survive: "Survive",
    comfortable: "Win Comfortably",
    dominate: "Dominate",
  };

  // AI assessment fetch
  const fetchAssessment = useCallback(async () => {
    if (totalVoters <= 1000) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/strategy/numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalVoters,
          votesCast,
          turnout,
          baseVotes,
          basePct,
          winTarget,
          ambition,
          voteGap,
          candidates,
          daysRemaining,
          dailyTarget,
          swingVotes,
          nonVoterVotes,
          switcherVotes,
          archetypeSummary,
          dominantEmotion,
          communityLeaders: communityLeaders || undefined,
          postalVotes: postalVotes || undefined,
          election_type: electionType,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiAssessment(data.assessment);
      setAiPrecedent(data.precedent);
      setAiEntryId(data.precedent_entry_id);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Assessment failed");
    } finally {
      setAiLoading(false);
    }
  }, [totalVoters, votesCast, turnout, baseVotes, basePct, winTarget, ambition, voteGap, candidates, daysRemaining, dailyTarget, swingVotes, nonVoterVotes, switcherVotes, archetypeSummary, dominantEmotion, communityLeaders, postalVotes, electionType]);

  useEffect(() => {
    if (totalVoters <= 1000) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchAssessment, 1200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchAssessment]);

  const handleCopy = () => {
    if (!aiAssessment) return;
    navigator.clipboard.writeText(aiAssessment);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenModal = (id: string) => {
    setModalEntryId(id);
    setModalOpen(true);
  };

  // Internal election placeholder
  if (isInternal) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)]">
        <div className="max-w-[1440px] mx-auto px-6 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold-dim)] border border-[var(--gold-border)] mb-8">
              <BarChart3 size={16} className="text-[var(--gold)]" />
              <span className="text-sm font-medium text-[var(--gold)]">Framework 3</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Delegate Numbers Calculator</h2>
            <p className="text-[var(--text-secondary)] text-lg mb-12">
              Internal election calculator — build Session B first
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)]">
              <div className="w-2 h-2 rounded-full bg-[var(--amber)] animate-pulse" />
              <span className="text-sm text-[var(--text-muted)]">InternalNumbersPanel will be integrated from Session B</span>
            </div>
          </div>
          <FrameworkNav currentFramework={3} electionType={electionType} />
        </div>
      </div>
    );
  }

  const candidateOptions = [
    { value: 2, label: "2", sub: "Straight fight", subDetail: "Threshold ~50.1%", color: "#3B82F6" },
    { value: 3, label: "3", sub: "Three-cornered", subDetail: "Threshold ~34-38%", color: "#F5A623" },
    { value: 4, label: "4", sub: "Multi-cornered", subDetail: "Threshold ~28-32%", color: "#F59E0B" },
    { value: 5, label: "5+", sub: "Many candidates", subDetail: "Threshold <28%", color: "#EF4444" },
  ];

  const ambitionOptions = [
    { value: "survive" as const, label: "SURVIVE", sub: "Minimum votes to win. Legal threshold. Recount-vulnerable.", mod: "-1%" },
    { value: "comfortable" as const, label: "WIN COMFORTABLY", sub: "Margin large enough to deter legal challenge and immediate rematch. Typically 1,000+ votes in a Malaysian seat.", mod: "+2%" },
    { value: "dominate" as const, label: "DOMINATE", sub: "Supermajority that signals strength within the party hierarchy and deters future challengers entirely.", mod: "+6%" },
  ];

  const forwardParams = new URLSearchParams();
  if (electionType) forwardParams.set("election_type", electionType);
  if (totalVoters) forwardParams.set("total_voters", totalVoters.toString());
  if (voteGap) forwardParams.set("vote_gap", voteGap.toString());
  if (dailyTarget) forwardParams.set("daily_target", dailyTarget.toString());
  if (daysRemaining) forwardParams.set("days_remaining", daysRemaining.toString());
  if (winTarget) forwardParams.set("win_target", winTarget.toString());

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-[1440px] mx-auto px-6 py-12">

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
          {["Know Your Ground", "Know Your Voter", "Game of Numbers", "Mobilisation", "Perceptions"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${i === 2 ? "bg-[var(--gold)] text-black" : "bg-[var(--bg-surface)] text-[var(--text-muted)]"}`}>
                {step}
              </div>
              {i < 4 && <span className="text-[var(--text-muted)] text-xs">&rarr;</span>}
            </div>
          ))}
        </div>

        {/* Page heading */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold-dim)] border border-[var(--gold-border)] mb-6">
            <BarChart3 size={16} className="text-[var(--gold)]" />
            <span className="text-sm font-medium text-[var(--gold)]">Framework 3</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Framework 3 — Game of Numbers</h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            The winning number is not an estimate. It is a calculation. Know yours precisely.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT COLUMN — INPUTS */}
          <div className="lg:col-span-2 space-y-8">

            {/* Section A: Voter Universe */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] p-6">
              <div className="flex items-center gap-2 mb-1">
                <Users size={16} className="text-[var(--gold)]" />
                <span className="text-xs font-semibold tracking-widest text-[var(--gold)] uppercase">The Voter Universe</span>
              </div>
              <div className="space-y-5 mt-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Total registered voters</label>
                  <input
                    type="number"
                    placeholder="e.g. 68,925 — enter your actual SPR count"
                    value={totalVoters || ""}
                    onChange={e => setTotalVoters(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[var(--text-muted)] focus:border-[var(--gold-border)] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Historical average turnout: <span className="text-[var(--gold)]">{turnout}%</span></label>
                  <input
                    type="range"
                    min={50}
                    max={95}
                    step={1}
                    value={turnout}
                    onChange={e => setTurnout(parseInt(e.target.value))}
                    className="w-full accent-[var(--gold)]"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">Malaysian parliamentary average: 73-82%. State elections tend lower. By-elections typically 60-70%.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Your estimated party base vote: <span className="text-[var(--gold)]">{basePct}%</span></label>
                  <input
                    type="range"
                    min={5}
                    max={55}
                    step={1}
                    value={basePct}
                    onChange={e => setBasePct(parseInt(e.target.value))}
                    className="w-full accent-[var(--gold)]"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">Conservative is safer. Base = votes you receive even if you run a poor campaign.</p>
                </div>
              </div>
            </motion.div>

            {/* Section B: Field Structure */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] p-6">
              <div className="flex items-center gap-2 mb-1">
                <Target size={16} className="text-[var(--gold)]" />
                <span className="text-xs font-semibold tracking-widest text-[var(--gold)] uppercase">Field Structure</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">This single input changes your winning mathematics more than any other variable.</p>
              <div className="grid grid-cols-2 gap-3">
                {candidateOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setCandidates(opt.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${candidates === opt.value ? "border-[var(--gold-border)] bg-[var(--gold-dim)]" : "border-[rgba(255,255,255,0.06)] bg-[var(--bg-base)] hover:border-[rgba(255,255,255,0.12)]"}`}
                  >
                    <div className="text-2xl font-bold mb-1" style={{ color: opt.color }}>{opt.label}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{opt.sub}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">{opt.subDetail}</div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Section C: Winning Ambition */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] p-6">
              <div className="flex items-center gap-2 mb-1">
                <Award size={16} className="text-[var(--gold)]" />
                <span className="text-xs font-semibold tracking-widest text-[var(--gold)] uppercase">Winning Ambition</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">A survival strategy is built differently from a mandate strategy. Choose which you&apos;re targeting.</p>
              <div className="space-y-3">
                {ambitionOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAmbition(opt.value)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${ambition === opt.value ? "border-[var(--gold-border)] bg-[var(--gold-dim)]" : "border-[rgba(255,255,255,0.06)] bg-[var(--bg-base)] hover:border-[rgba(255,255,255,0.12)]"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white">{opt.label}</span>
                      <span className="text-xs text-[var(--gold)]">{opt.mod}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Section D: Campaign Timeline */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-[var(--gold)]" />
                <span className="text-xs font-semibold tracking-widest text-[var(--gold)] uppercase">Campaign Timeline</span>
              </div>
              <label className="block text-sm font-medium text-white mb-2">Days remaining until polling day</label>
              <input
                type="number"
                placeholder="e.g. 42"
                value={daysRemaining || ""}
                onChange={e => setDaysRemaining(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[var(--text-muted)] focus:border-[var(--gold-border)] focus:outline-none transition-colors"
              />
            </motion.div>

            {/* Section E: Vote Source Intelligence */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] p-6">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-[var(--gold)]" />
                <span className="text-xs font-semibold tracking-widest text-[var(--gold)] uppercase">Vote Source Intelligence</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">Optional — improves the precision of your AI assessment. Skip if unknown.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Known community leader endorsements secured</label>
                  <input
                    type="number"
                    placeholder="e.g. 3"
                    value={communityLeaders || ""}
                    onChange={e => setCommunityLeaders(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[var(--text-muted)] focus:border-[var(--gold-border)] focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">Each community leader influences an estimated 150-400 voters in their network</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Estimated postal votes in this seat</label>
                  <input
                    type="number"
                    placeholder="e.g. 2,400"
                    value={postalVotes || ""}
                    onChange={e => setPostalVotes(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[rgba(255,255,255,0.08)] text-white placeholder:text-[var(--text-muted)] focus:border-[var(--gold-border)] focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">Military, police, civil servants. These tend to skew toward incumbent or establishment candidate.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN — LIVE CALCULATIONS */}
          <div className="lg:col-span-3 space-y-6">

            {/* Metric Cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] p-5">
                <div className="text-xs font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-2">Expected Votes Cast</div>
                <div className="text-2xl font-bold text-white">{totalVoters > 0 ? formatNum(votesCast) : "—"}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">At {turnout}% turnout</div>
              </div>
              <div className="rounded-xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] p-5">
                <div className="text-xs font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-2">Your Base Votes</div>
                <div className="text-2xl font-bold text-white">{totalVoters > 0 ? formatNum(baseVotes) : "—"}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">Estimated party loyalists ({basePct}%)</div>
              </div>
              <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--gold-border)] p-5">
                <div className="text-xs font-semibold tracking-widest text-[var(--gold)] uppercase mb-2">Winning Target</div>
                <div className="text-3xl font-bold text-[var(--gold)]">{totalVoters > 0 ? formatNum(winTarget) : "—"}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{ambitionLabels[ambition]} target</div>
              </div>
              <div className="rounded-xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] p-5">
                <div className="text-xs font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-2">Votes Still Needed</div>
                {voteGap === 0 && totalVoters > 0 ? (
                  <>
                    <div className="text-2xl font-bold text-[#22C55E]">0 — Base sufficient</div>
                    <div className="text-xs text-[#22C55E] mt-1">Your loyalty base exceeds the winning target. Focus on turnout, not persuasion.</div>
                  </>
                ) : (
                  <>
                    <div className={`text-2xl font-bold ${voteGap > 0 ? "text-[#EF4444]" : "text-white"}`}>{totalVoters > 0 ? formatNum(voteGap) : "—"}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">Beyond your base</div>
                  </>
                )}
              </div>
            </motion.div>

            {/* 1-in-N Insight Block */}
            <AnimatePresence>
              {oneInN !== null && totalVoters > 0 && voteGap > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl bg-[var(--bg-base)] border border-[rgba(255,255,255,0.08)] p-8 text-center"
                >
                  <div className="text-lg text-white mb-2">
                    1 in every
                  </div>
                  <div className="text-6xl font-bold text-[var(--gold)] mb-2">
                    {oneInN}
                  </div>
                  <div className="text-lg text-white mb-4">
                    registered voters must choose you.
                  </div>
                  <div className="text-sm text-[var(--text-muted)] italic">
                    That is your campaign&apos;s singular problem. Everything else is how you solve it.
                  </div>
                </motion.div>
              )}
              {totalVoters > 0 && voteGap === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-[var(--bg-base)] border border-[rgba(34,197,94,0.3)] p-8 text-center"
                >
                  <div className="text-lg text-[#22C55E] font-medium">
                    Your base already exceeds your winning target.
                  </div>
                  <div className="text-sm text-[var(--text-muted)] mt-2">
                    Your only job now is turnout.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Bar */}
            {totalVoters > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] p-6">
                <div className="text-xs font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-3">Your base as % of your winning target</div>
                <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
                  <span>Base ({basePct}% loyalty)</span>
                  <span>Winning target ({ambitionLabels[ambition]})</span>
                </div>
                <div className="w-full h-4 rounded-full bg-[#1A1A1A] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-400"
                    style={{
                      width: `${baseAsPercentOfTarget}%`,
                      backgroundColor: baseAsPercentOfTarget >= 100 ? "#22C55E" : "var(--gold)",
                    }}
                  />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  {baseAsPercentOfTarget >= 100
                    ? "Base exceeds target — vote suppression is your only real threat."
                    : `You have ${baseAsPercentOfTarget}% of your target locked in. ${100 - baseAsPercentOfTarget}% must come from new voters.`
                  }
                </p>
              </motion.div>
            )}

            {/* Vote Source Breakdown */}
            {totalVoters > 0 && voteGap > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] p-6">
                <div className="text-xs font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-1">Where the gap votes must come from</div>
                <p className="text-xs text-[var(--text-muted)] mb-5">Every vote you need beyond your base must come from one of three sources. There are no others.</p>

                <div className="space-y-5">
                  {[
                    { label: "Undecided swing voters", count: swingVotes, color: "#2980B9", width: 57, note: "Highest volume, moderate conversion difficulty. These are voters who could go either way — most persuadable but require direct contact." },
                    { label: "Previous non-voters to activate", count: nonVoterVotes, color: "#27AE60", width: 29, note: "Dormant supporters who need activation, not persuasion. If they voted before and chose your party — they're yours if you reach them." },
                    { label: "Soft opposition switchers", count: switcherVotes, color: "#D4862A", width: 14, note: "Lowest volume, highest conversion difficulty, most expensive to reach. Only pursue if the gap cannot be closed from swing and non-voter sources alone." },
                  ].map(source => (
                    <div key={source.label}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-white">{source.label}</span>
                        <span className="text-sm font-bold text-white">{formatNum(source.count)}</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#1A1A1A] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${source.width}%`, backgroundColor: source.color }} />
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{source.note}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[var(--text-muted)] italic mt-4">The sequencing matters: saturate swing voters and non-voter activation first. Switcher persuasion is last resort.</p>
              </motion.div>
            )}

            {/* Daily Operational Target */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl bg-[#111111] border-l-4 border-[var(--gold)] p-6">
              <div className="text-xs font-semibold tracking-widest text-[var(--gold)] uppercase mb-4">Daily Operational Target</div>
              {dailyTarget !== null ? (
                <>
                  <div className="text-4xl font-bold text-[var(--gold)] mb-1">{formatNum(dailyTarget)}</div>
                  <div className="text-lg text-white mb-3">new voter contacts every single day until polling day</div>
                  <div className="text-sm text-[var(--text-muted)] mb-4">
                    {formatNum(voteGap)} votes needed &divide; {daysRemaining} days
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ color: dailyStatus.color, backgroundColor: dailyStatus.bg }}>
                    {dailyStatus.label}
                  </div>
                </>
              ) : (
                <div className="text-sm text-[var(--text-muted)]">— enter days remaining</div>
              )}
              <p className="text-xs text-[var(--text-muted)] mt-4">This number is why ground machinery exists. Every volunteer, every branch, every door knocked — all in service of this single daily target.</p>
            </motion.div>

            {/* Polling District Priority Alert */}
            {totalVoters > 10000 && voteGap > 1000 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-[#F59E0B]" />
                  <span className="text-xs font-semibold tracking-widest text-[#F59E0B] uppercase">Polling District Priority</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  With {formatNum(voteGap)} votes to close, concentrate your ground resources. Identify your 3 highest-potential swing districts — polling streams where the third or losing candidate polled most strongly in the previous election. The votes splitting away from your opponents in those districts are the most accessible source for your gap.
                </p>
              </motion.div>
            )}

            {/* Postal Vote Intelligence */}
            {postalVotes > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Mail size={16} className="text-[var(--gold)]" />
                  <span className="text-xs font-semibold tracking-widest text-[var(--gold)] uppercase">Postal Vote Consideration</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {formatNum(postalVotes)} postal votes are registered in this seat. Postal votes — military, police, civil servants — historically skew toward the incumbent or establishment candidate. Your gap calculation above already reflects this structural reality. Ensure your SPR postal vote machinery is fully activated.
                </p>
              </motion.div>
            )}

            {/* Scenario Simulation Panel */}
            {totalVoters > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)] overflow-hidden">
                <button
                  onClick={() => setScenarioOpen(!scenarioOpen)}
                  className="w-full flex items-center justify-between p-6 hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-[var(--gold)]" />
                    <span className="text-xs font-semibold tracking-widest text-[var(--gold)] uppercase">Scenario Simulation</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <span className="text-xs">Run a turnout scenario</span>
                    {scenarioOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </button>

                <AnimatePresence>
                  {scenarioOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { label: `If turnout drops 8%`, data: lowScenario, turnoutVal: Math.max(50, turnout - 8), borderColor: "#EF4444" },
                            { label: "Your current scenario", data: { votesCast, winTarget, voteGap }, turnoutVal: turnout, borderColor: "var(--gold)" },
                            { label: `If turnout rises 8%`, data: highScenario, turnoutVal: Math.min(95, turnout + 8), borderColor: "#22C55E" },
                          ].map(scenario => (
                            <div key={scenario.label} className="rounded-xl bg-[var(--bg-base)] border p-4" style={{ borderColor: scenario.borderColor }}>
                              <div className="text-xs font-medium text-[var(--text-muted)] mb-3">{scenario.label}</div>
                              <div className="text-xs text-[var(--text-muted)] mb-1">Turnout: {scenario.turnoutVal}%</div>
                              <div className="space-y-2">
                                <div>
                                  <div className="text-xs text-[var(--text-muted)]">Votes cast</div>
                                  <div className="text-sm font-bold text-white">{formatNum(scenario.data.votesCast)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-[var(--text-muted)]">Win target</div>
                                  <div className="text-sm font-bold text-white">{formatNum(scenario.data.winTarget)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-[var(--text-muted)]">Vote gap</div>
                                  <div className="text-sm font-bold" style={{ color: scenario.data.voteGap > 0 ? "#EF4444" : "#22C55E" }}>{formatNum(scenario.data.voteGap)}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-4">
                          Turnout sensitivity: A &plusmn;8% turnout swing changes your winning target by approximately {formatNum(turnoutSensitivity)} votes.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* AI Strategic Assessment */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-2xl bg-[var(--bg-surface)] border-l-4 border-[var(--gold)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-[var(--gold)]" />
                  <span className="text-xs font-semibold tracking-widest text-[var(--gold)] uppercase">Strategic Assessment &middot; AI Intelligence</span>
                </div>
                {aiAssessment && (
                  <button onClick={handleCopy} className="text-[var(--text-muted)] hover:text-white transition-colors">
                    {copied ? <Check size={14} className="text-[#22C55E]" /> : <Copy size={14} />}
                  </button>
                )}
              </div>

              {aiLoading && (
                <div className="flex items-center gap-3 py-8">
                  <Loader2 size={18} className="text-[var(--gold)] animate-spin" />
                  <span className="text-sm text-[var(--text-muted)]">Calculating your position...</span>
                </div>
              )}

              {aiError && (
                <p className="text-sm text-[#EF4444] py-4">{aiError}</p>
              )}

              {!aiLoading && !aiError && aiAssessment && (
                <div>
                  <p className="text-[15px] leading-[1.7] text-white whitespace-pre-line">{aiAssessment}</p>
                  <PrecedentPulse precedent={aiPrecedent} entryId={aiEntryId} onOpenModal={handleOpenModal} />
                </div>
              )}

              {!aiLoading && !aiError && !aiAssessment && totalVoters <= 1000 && (
                <p className="text-sm text-[var(--text-muted)] py-4">Enter at least 1,000 total voters to activate AI strategic assessment.</p>
              )}

              {!aiLoading && !aiError && !aiAssessment && totalVoters > 1000 && (
                <p className="text-sm text-[var(--text-muted)] py-4">Waiting for inputs to stabilize...</p>
              )}
            </motion.div>

          </div>
        </div>

        <FrameworkNav currentFramework={3} electionType={electionType} />
      </div>

      <PrecedentModal entryId={modalEntryId} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default function GameOfNumbers() {
  return (
    <Suspense>
      <GameOfNumbersContent />
    </Suspense>
  );
}
