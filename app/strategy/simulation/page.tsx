"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crosshair, Shield, Users, Megaphone, Target,
  BarChart3, Flame, TrendingUp, TrendingDown, Minus,
  Copy, RotateCcw, Zap, AlertTriangle, Brain,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

// ─── Types ───
interface FrameworkImpact {
  framework: string;
  label: string;
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  impact: string;
  adaptation: string;
}

interface SimulationResult {
  baseScore: number;
  adjustedScore: number;
  moveImpacts: FrameworkImpact[];
  briefing: string;
}

interface OpponentMove {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const opponentMoves: OpponentMove[] = [
  {
    id: "Flooded your swing districts",
    title: "Flooded your swing districts",
    description: "Opponent deployed heavy machinery to your target polling streams",
    icon: Users,
  },
  {
    id: "Launched a negative campaign",
    title: "Launched a negative campaign",
    description: "Personal attack or smear circulating in the constituency",
    icon: Megaphone,
  },
  {
    id: "Co-opted your dominant issue",
    title: "Co-opted your dominant issue",
    description: "Opponent announced a policy that addresses your #1 voter concern",
    icon: Target,
  },
  {
    id: "Built a coalition",
    title: "Built a coalition",
    description: "Two opponents are now coordinating against you",
    icon: Users,
  },
  {
    id: "Activated community leaders",
    title: "Activated community leaders",
    description: "Key village heads / religious figures now publicly supporting opponent",
    icon: Shield,
  },
  {
    id: "Made a popular promise",
    title: "Made a popular promise",
    description: "Opponent announced a tangible, specific local pledge",
    icon: Zap,
  },
  {
    id: "Attacked your credibility",
    title: "Attacked your credibility",
    description: "Personal background, track record, or character under public attack",
    icon: AlertTriangle,
  },
];

const severityOptions = [
  { id: "minor", label: "Minor", description: "Limited reach, local only" },
  { id: "significant", label: "Significant", description: "Gaining traction, spreading" },
  { id: "critical", label: "Critical", description: "Going viral, major damage" },
];

// ─── Helpers ───
function getScoreColor(score: number) {
  if (score > 70) return "#22C55E";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

function getImpactColor(level: string) {
  switch (level) {
    case "LOW": return "#22C55E";
    case "MEDIUM": return "#F59E0B";
    case "HIGH": return "#EF4444";
    case "CRITICAL": return "#991B1B";
    default: return "#6B7280";
  }
}

function getImpactBg(level: string) {
  switch (level) {
    case "LOW": return "rgba(34, 197, 94, 0.1)";
    case "MEDIUM": return "rgba(245, 158, 11, 0.1)";
    case "HIGH": return "rgba(239, 68, 68, 0.1)";
    case "CRITICAL": return "rgba(153, 27, 27, 0.15)";
    default: return "rgba(107, 114, 128, 0.1)";
  }
}

const frameworkIcons: Record<string, React.ElementType> = {
  F1: Target,
  F2: Users,
  F3: BarChart3,
  F4: Megaphone,
  F5: Flame,
};

// ─── Main Page ───
export default function SimulationPage() {
  const [selectedMove, setSelectedMove] = useState<string>("");
  const [severity, setSeverity] = useState<string>("significant");
  const [groundCoverage, setGroundCoverage] = useState(65);
  const [numbersPace, setNumbersPace] = useState(55);
  const [perceptionMomentum, setPerceptionMomentum] = useState(60);
  const [daysRemaining, setDaysRemaining] = useState(30);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const currentScore = result ? result.adjustedScore : Math.round(
    groundCoverage * 0.25 + numbersPace * 0.35 + perceptionMomentum * 0.25 + ((daysRemaining / 60) * 100) * 0.15
  );

  const scoreColor = getScoreColor(currentScore);

  async function runSimulation() {
    if (!selectedMove) return;
    setLoading(true);

    // Store previous score for trend
    setPreviousScore(currentScore);

    try {
      const res = await fetch("/api/strategy/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opponentMove: selectedMove,
          severity,
          groundCoverage,
          numbersPace,
          perceptionMomentum,
          daysRemaining,
        }),
      });
      const data = await res.json();

      // Brief loading pause for dramatic effect
      await new Promise((r) => setTimeout(r, 800));
      setResult(data);

      // Scroll to results
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }

  function resetSimulation() {
    setResult(null);
    setSelectedMove("");
    setSeverity("significant");
    setPreviousScore(null);
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const TrendIcon = result
    ? previousScore !== null
      ? result.adjustedScore > previousScore ? TrendingUp
        : result.adjustedScore < previousScore ? TrendingDown
        : Minus
      : Minus
    : Minus;

  const trendColor = result && previousScore !== null
    ? result.adjustedScore > previousScore ? "#22C55E"
      : result.adjustedScore < previousScore ? "#EF4444"
      : "#6B7280"
    : "#6B7280";

  return (
    <div className="min-h-screen" style={{ background: "#050505" }}>
      <div className="max-w-[1440px] mx-auto px-6 py-8">

        {/* ─── STRATEGIC POSITION SCORE ─── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] mb-6">
            <Crosshair size={14} className="text-red-400" />
            <span className="text-xs font-medium text-red-400 tracking-wider uppercase">Adversarial Simulation</span>
          </div>

          <div className="flex items-center justify-center gap-4 mb-3">
            <motion.span
              key={currentScore}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-7xl font-bold tabular-nums"
              style={{ color: scoreColor }}
            >
              {currentScore}
            </motion.span>
            {(result || previousScore !== null) && (
              <TrendIcon size={28} style={{ color: trendColor }} />
            )}
          </div>
          <p className="text-sm text-[var(--text-muted)]">Strategic Position Score</p>

          {/* Score component sliders */}
          <div className="flex items-center justify-center gap-8 mt-6">
            {[
              { label: "Ground Coverage", value: groundCoverage, setter: setGroundCoverage, weight: "25%" },
              { label: "Numbers Pace", value: numbersPace, setter: setNumbersPace, weight: "35%" },
              { label: "Perception", value: perceptionMomentum, setter: setPerceptionMomentum, weight: "25%" },
              { label: "Days Buffer", value: daysRemaining, setter: setDaysRemaining, weight: "15%", max: 60 },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xs text-[var(--text-muted)] mb-1">{s.label} <span className="text-[var(--gold)]">({s.weight})</span></p>
                <input
                  type="range"
                  min={0}
                  max={s.max || 100}
                  value={s.value}
                  onChange={(e) => { s.setter(parseInt(e.target.value)); if (result) setResult(null); }}
                  className="w-24 accent-[var(--gold)]"
                />
                <p className="text-xs font-medium mt-1" style={{ color: getScoreColor(s.max ? (s.value / s.max) * 100 : s.value) }}>
                  {s.value}{s.label === "Days Buffer" ? "d" : "%"}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── OPPONENT MOVE SELECTOR ─── */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">Simulate an opponent move</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Select what your opponent has done or is likely to do. The platform will recalibrate your strategy across all 5 frameworks.
            </p>
          </div>

          {/* Move cards grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {opponentMoves.map((move) => {
              const isSelected = selectedMove === move.id;
              const Icon = move.icon;
              return (
                <button
                  key={move.id}
                  onClick={() => { setSelectedMove(move.id); if (result) setResult(null); }}
                  className={`
                    p-4 rounded-xl border text-left transition-all
                    ${isSelected
                      ? "bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.5)] shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                      : "bg-[var(--bg-surface)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(239,68,68,0.3)]"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-[rgba(239,68,68,0.2)]" : "bg-[var(--bg-elevated)]"}`}>
                      <Icon size={16} className={isSelected ? "text-red-400" : "text-[var(--text-muted)]"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium mb-1 ${isSelected ? "text-red-300" : "text-white"}`}>
                        {move.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {move.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Severity selector */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {severityOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setSeverity(opt.id); if (result) setResult(null); }}
                className={`
                  px-5 py-2.5 rounded-full text-sm font-medium border transition-all
                  ${severity === opt.id
                    ? opt.id === "critical"
                      ? "bg-[rgba(239,68,68,0.15)] text-red-400 border-[rgba(239,68,68,0.4)]"
                      : opt.id === "significant"
                        ? "bg-[rgba(245,158,11,0.15)] text-amber-400 border-[rgba(245,158,11,0.4)]"
                        : "bg-[rgba(34,197,94,0.15)] text-green-400 border-[rgba(34,197,94,0.4)]"
                    : "bg-transparent text-[var(--text-secondary)] border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
                  }
                `}
              >
                <span>{opt.label}</span>
                <span className="text-xs ml-2 opacity-60">— {opt.description}</span>
              </button>
            ))}
          </div>

          {/* SIMULATE button */}
          <div className="text-center">
            <button
              onClick={runSimulation}
              disabled={!selectedMove || loading}
              className={`
                px-10 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all
                ${selectedMove && !loading
                  ? "bg-[var(--gold)] text-black hover:brightness-110 gold-glow cursor-pointer"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed"
                }
              `}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Recalculating strategic position...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Crosshair size={16} />
                  Simulate
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ─── FRAMEWORK IMPACT PANEL ─── */}
        <AnimatePresence>
          {result && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {/* Score change banner */}
              <div className="text-center mb-8 py-4 rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.05)]">
                <p className="text-sm text-[var(--text-muted)]">Strategic Position</p>
                <div className="flex items-center justify-center gap-4 mt-1">
                  <span className="text-2xl font-bold" style={{ color: getScoreColor(result.baseScore) }}>
                    {result.baseScore}
                  </span>
                  <ArrowRight size={20} className="text-red-400" />
                  <span className="text-3xl font-bold" style={{ color: getScoreColor(result.adjustedScore) }}>
                    {result.adjustedScore}
                  </span>
                  <span className="text-sm text-red-400 font-medium">
                    (−{result.baseScore - result.adjustedScore} pts)
                  </span>
                </div>
              </div>

              {/* 5 Framework impact cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8">
                {result.moveImpacts.map((impact) => {
                  const FwIcon = frameworkIcons[impact.framework] || Target;
                  return (
                    <motion.div
                      key={impact.framework}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * parseInt(impact.framework.replace("F", "")) }}
                      className="rounded-xl border p-4"
                      style={{
                        background: getImpactBg(impact.level),
                        borderColor: `${getImpactColor(impact.level)}40`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <FwIcon size={14} style={{ color: getImpactColor(impact.level) }} />
                        <span className="text-xs font-medium text-[var(--text-muted)]">{impact.framework}</span>
                      </div>
                      <p className="text-xs font-medium text-white mb-1">{impact.label}</p>
                      <div
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider mb-3"
                        style={{
                          background: `${getImpactColor(impact.level)}20`,
                          color: getImpactColor(impact.level),
                        }}
                      >
                        {impact.level}
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-2">
                        {impact.impact}
                      </p>
                      <div className="border-t border-[rgba(255,255,255,0.06)] pt-2 mt-2">
                        <p className="text-[10px] text-[var(--gold)] font-medium mb-1">ADAPT</p>
                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                          {impact.adaptation}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* AI STRATEGIC ADAPTATION card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-xl border-l-4 border-[var(--gold)] bg-[var(--bg-surface)] p-6 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--gold-dim)]">
                      <Brain size={18} className="text-[var(--gold)]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--gold)] tracking-wider">AI STRATEGIC ADAPTATION</p>
                      <p className="text-[10px] text-[var(--text-muted)]">War Room Briefing — AI Generated</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyText(result.briefing, "briefing")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--gold-dim)] transition-all"
                  >
                    <Copy size={12} />
                    {copied === "briefing" ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {result.briefing}
                </p>
              </motion.div>

              {/* Reset button */}
              <div className="text-center mt-8 mb-4">
                <button
                  onClick={resetSimulation}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-sm text-[var(--text-secondary)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
                >
                  <RotateCcw size={14} />
                  Clear simulation / return to baseline position
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Bottom nav ─── */}
        <div className="border-t border-[rgba(255,255,255,0.06)] mt-12 pt-8 pb-12">
          <div className="flex items-center justify-between">
            <Link
              href="/strategy/perceptions"
              className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[var(--bg-surface)] hover:border-[var(--gold-border)] transition-all group"
            >
              <span className="text-[var(--text-muted)] group-hover:text-[var(--gold)] transition-colors">←</span>
              <div className="text-left">
                <span className="text-xs text-[var(--text-muted)] block">Previous</span>
                <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-white transition-colors">
                  F5 — Managing Perceptions
                </span>
              </div>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[var(--gold-border)] bg-[var(--gold-dim)] hover:bg-[rgba(245,166,35,0.25)] transition-all group"
            >
              <div className="text-right">
                <span className="text-xs text-[var(--gold)] block">Complete</span>
                <span className="text-sm font-medium text-white">Back to Command Centre</span>
              </div>
              <ArrowRight size={16} className="text-[var(--gold)]" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
