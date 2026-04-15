"use client";

import { useState, useEffect, useCallback, useRef, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Flame, Eye, MessageSquare, Radio,
  Shield, AlertTriangle, Brain, Copy, Check, Zap,
  Target, Megaphone, Lock, ChevronRight,
  Compass, Fingerprint, Lightbulb, ScrollText, Gauge,
  Printer, RefreshCw, Sparkles, ArrowRight, CheckCircle2,
} from "lucide-react";
import FrameworkNav from "@/components/FrameworkNav";
import { getPerceptionLabels } from "@/lib/strategy/perceptionLabels";
import PrecedentPulse from "@/components/intelligence/PrecedentPulse";
import PrecedentModal from "@/components/intelligence/PrecedentModal";

// ─── Reused Types & Constants ─────────────────────────────────────────────

interface TacticalData {
  voterPerception: string;
  positioning: string;
  negativeNarratives: string;
  digitalPlatform: string;
  mediaAccess: string;
  communityChannels: string[];
  activeAttack: boolean;
  attackDescription: string;
  attackSeverity: string;
  daysRemaining: number;
}

const defaultTactical: TacticalData = {
  voterPerception: "",
  positioning: "",
  negativeNarratives: "",
  digitalPlatform: "",
  mediaAccess: "",
  communityChannels: [],
  activeAttack: false,
  attackDescription: "",
  attackSeverity: "",
  daysRemaining: 0,
};

const perceptionOptions = [
  "Unknown — need introduction",
  "Known but not fully trusted",
  "Liked but seen as inexperienced",
  "Established and respected",
  "Under attack — need to defend",
];

const digitalPlatformOptions = [
  "Facebook dominant",
  "TikTok dominant",
  "WhatsApp network",
  "Mixed digital",
];

const mediaAccessOptions = [
  "Strong — regular coverage",
  "Moderate — occasional coverage",
  "Weak — minimal coverage",
];

const communityChannelOptions = [
  { id: "surau", label: "Surau network" },
  { id: "chinese", label: "Chinese associations / guilds" },
  { id: "ngo", label: "NGO relationships" },
  { id: "leaders", label: "Community leaders" },
  { id: "unions", label: "Trade unions / worker groups" },
];

const severityOptions = [
  "Minor — limited reach",
  "Moderate — gaining traction",
  "Severe — going viral",
];

// ─── 5-Phase Option Sets ──────────────────────────────────────────────────

const dominantEmotionOptions = [
  "FRUSTRATED — things are broken and nothing changes",
  "ANXIOUS — worried about what's coming next",
  "ANGRY — someone is to blame and must be held accountable",
  "HOPEFUL — ready to believe something better is possible",
  "FATIGUED — tired of politics, disengaged, cynical",
  "PROUD — believe this place matters and want it seen",
];

const blameOptions = [
  "The incumbent personally",
  "The ruling party / coalition",
  "The opposition for failing to hold power accountable",
  "The system broadly — all politicians the same",
  "External forces — federal, economic, global",
];

const currentPerceptionOptions = [
  "Unknown",
  "Known but not trusted",
  "Liked but inexperienced",
  "Established but stale",
  "Under active attack",
  "Clean slate",
];

const contrastOptions = [
  "Experience vs freshness",
  "Freshness vs experience",
  "Service vs access",
  "Reform vs establishment",
  "Competence vs loyalty",
  "Identity vs outsider",
  "Custom",
];

const vulnerabilityOptions = [
  "Too young",
  "Outsider to the area",
  "Political baggage",
  "Legal-ethical concerns",
  "Party affiliation",
  "Personal background",
  "Custom",
];

const credibleAdvantageOptions = [
  { id: "local-roots", label: "Deep local roots" },
  { id: "track-record", label: "Proven track record" },
  { id: "professional", label: "Professional expertise" },
  { id: "govt-relationships", label: "Govt relationships" },
  { id: "private-network", label: "Private sector network" },
  { id: "religious", label: "Religious / community credibility" },
  { id: "youth", label: "Youth / energy" },
  { id: "no-debt", label: "No political debt" },
  { id: "financial", label: "Financial independence" },
  { id: "language", label: "Language ability" },
  { id: "personal-exp", label: "Personal experience of core problem" },
];

const attackOptions = [
  "You can't deliver this",
  "You've promised and failed before",
  "Too vague to hold accountable",
  "Your party won't support this",
  "This is someone else's plan",
  "Custom",
];

// ─── Shared Inputs ────────────────────────────────────────────────────────

function RadioCards({
  label, options, value, onChange, columns,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  columns?: number;
}) {
  return (
    <div>
      <label className="text-xs text-[var(--text-muted)] block mb-2">{label}</label>
      <div
        className={columns ? `grid gap-2` : "flex flex-wrap gap-2"}
        style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
      >
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
              value === opt
                ? "bg-[var(--gold-dim)] text-[var(--gold)] border-[var(--gold-border)]"
                : "bg-transparent text-[var(--text-secondary)] border-[rgba(255,255,255,0.1)] hover:border-[var(--gold-border)]"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckboxGrid({
  label, options, values, onChange, columns = 2,
}: {
  label: string;
  options: { id: string; label: string }[];
  values: string[];
  onChange: (v: string[]) => void;
  columns?: number;
}) {
  const toggle = (id: string) => {
    if (values.includes(id)) onChange(values.filter((v) => v !== id));
    else onChange([...values, id]);
  };
  return (
    <div>
      <label className="text-xs text-[var(--text-muted)] block mb-2">{label}</label>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => toggle(opt.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
              values.includes(opt.id)
                ? "bg-[var(--gold-dim)] text-[var(--gold)] border-[var(--gold-border)]"
                : "bg-transparent text-[var(--text-secondary)] border-[rgba(255,255,255,0.1)] hover:border-[var(--gold-border)]"
            }`}
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
              values.includes(opt.id) ? "border-[var(--gold)] bg-[var(--gold-dim)]" : "border-[rgba(255,255,255,0.2)]"
            }`}>
              {values.includes(opt.id) && <Check size={10} />}
            </div>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function TextInput({
  label, value, onChange, placeholder, maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="text-xs text-[var(--text-muted)] block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
      />
      {maxLength && (
        <p className="text-[10px] text-[var(--text-muted)] mt-1 text-right">{value.length}/{maxLength}</p>
      )}
    </div>
  );
}

function TextArea({
  label, value, onChange, placeholder, rows = 3, maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="text-xs text-[var(--text-muted)] block mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(maxLength ? e.target.value.slice(0, maxLength) : e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors resize-none"
      />
      {maxLength && (
        <p className="text-[10px] text-[var(--text-muted)] mt-1 text-right">{value.length}/{maxLength}</p>
      )}
    </div>
  );
}

// ─── AI Intelligence Output Card ──────────────────────────────────────────

function AIOutputCard({
  title, content, loading, provenance,
  precedent, entryId, onOpenModal,
}: {
  title: string;
  content: string;
  loading: boolean;
  provenance: string;
  precedent?: string | null;
  entryId?: string | null;
  onOpenModal?: (entryId: string) => void;
}) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--gold)]" />
      <div className="p-5 pl-6">
        <div className="flex items-center gap-2 mb-3">
          <Brain size={16} className="text-[var(--gold)]" />
          <span className="text-xs font-bold text-[var(--gold)] tracking-wider">{title}</span>
        </div>
        {loading ? (
          <div className="flex items-center gap-3 py-4">
            <div className="w-4 h-4 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--text-secondary)]">Generating intelligence…</span>
          </div>
        ) : content ? (
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">Complete the phase inputs to activate AI intelligence.</p>
        )}
        {!loading && content && precedent && onOpenModal && (
          <PrecedentPulse precedent={precedent} entryId={entryId ?? null} onOpenModal={onOpenModal} />
        )}
        <p className="mt-3 text-[11px] italic text-[var(--gold)] opacity-70">{provenance}</p>
      </div>
    </div>
  );
}

// ─── Phase Tracker ────────────────────────────────────────────────────────

type PhaseId = 1 | 2 | 3 | 4 | 5;

const PHASES: { id: PhaseId; label: string; icon: React.ElementType; tagline: string }[] = [
  { id: 1, label: "DISCOVER", icon: Compass, tagline: "Understand the voter" },
  { id: 2, label: "DEFINE", icon: Fingerprint, tagline: "Position the candidate" },
  { id: 3, label: "IDEA", icon: Lightbulb, tagline: "Forge the promises" },
  { id: 4, label: "DEVELOP", icon: ScrollText, tagline: "Author the manifesto" },
  { id: 5, label: "MEASURE", icon: Gauge, tagline: "Stress-test the narrative" },
];

function PhaseTracker({
  active, completed, onJump,
}: {
  active: PhaseId;
  completed: Set<PhaseId>;
  onJump: (p: PhaseId) => void;
}) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-4 mb-6">
      <div className="flex items-center gap-2 overflow-x-auto">
        {PHASES.map((phase, i) => {
          const isComplete = completed.has(phase.id);
          const isActive = active === phase.id;
          const isLocked = !isComplete && !isActive && !completed.has((phase.id - 1) as PhaseId) && phase.id > 1;
          const Icon = phase.icon;
          return (
            <div key={phase.id} className="flex items-center shrink-0">
              <button
                onClick={() => {
                  if (isComplete || isActive || completed.has((phase.id - 1) as PhaseId) || phase.id === 1) {
                    onJump(phase.id);
                  }
                }}
                disabled={isLocked}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-xs font-semibold tracking-wider ${
                  isActive
                    ? "bg-[var(--gold-dim)] text-[var(--gold)] border-[var(--gold-border)]"
                    : isComplete
                      ? "bg-transparent text-[var(--gold)] border-[var(--gold-border)] hover:bg-[var(--gold-dim)] cursor-pointer"
                      : isLocked
                        ? "bg-transparent text-[var(--text-muted)] border-[rgba(255,255,255,0.05)] opacity-50 cursor-not-allowed"
                        : "bg-transparent text-[var(--text-secondary)] border-[rgba(255,255,255,0.1)] hover:border-[var(--gold-border)]"
                }`}
              >
                {isComplete ? <CheckCircle2 size={14} /> : isLocked ? <Lock size={12} /> : <Icon size={14} />}
                <span className="hidden sm:inline">{phase.label}</span>
                <span className="sm:hidden">{phase.id}</span>
              </button>
              {i < PHASES.length - 1 && (
                <ChevronRight size={14} className="text-[var(--text-muted)] mx-1 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-[11px] text-[var(--text-muted)]">
        Phase {active}/5 — {PHASES.find((p) => p.id === active)?.tagline}
      </div>
    </div>
  );
}

// ─── Phase Section Wrapper ────────────────────────────────────────────────

function PhaseSection({
  phase, active, children,
}: {
  phase: PhaseId;
  active: PhaseId;
  children: React.ReactNode;
}) {
  if (phase !== active) return null;
  const info = PHASES.find((p) => p.id === phase)!;
  const Icon = info.icon;
  return (
    <motion.section
      key={phase}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-[var(--gold-dim)]">
          <Icon size={20} className="text-[var(--gold)]" />
        </div>
        <div>
          <h3 className="text-xl font-bold">
            Phase {phase} — <span className="text-[var(--gold)]">{info.label}</span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">{info.tagline}</p>
        </div>
      </div>
      {children}
    </motion.section>
  );
}

// ─── SEED/BUILD/MANAGE tactical phase helper (preserved) ──────────────────

function getTacticalPhase(daysRemaining: number): "SEED" | "BUILD" | "MANAGE" {
  if (daysRemaining > 30 || daysRemaining === 0) return "SEED";
  if (daysRemaining >= 14) return "BUILD";
  return "MANAGE";
}

// ─── Data Types for 5-Phase ───────────────────────────────────────────────

interface Phase1Data {
  dominantEmotion: string;
  problem1: string;
  problem2: string;
  problem3: string;
  whoBlame: string;
  whatTheyWant: string;
  currentPerception: string;
}
interface Phase2Data {
  candidateIdentity: string;
  contrast: string;
  contrastCustom: string;
  positioningStatement: string;
  oneThing: string;
  vulnerability: string;
  vulnerabilityCustom: string;
  vulnerabilityCounter: string;
}
interface Promise { text: string; why: string; how: string }
interface Phase3Data {
  credibleAdvantages: string[];
  promise1: Promise;
  promise2: Promise;
  promise3: Promise;
  uniquePledge: string;
  whyNow: string;
}
interface PledgeBlock { commitment: string; accountability: string }
interface Manifesto {
  vision_statement: string;
  who_i_am: string;
  pledge_1: PledgeBlock;
  pledge_2: PledgeBlock;
  pledge_3: PledgeBlock;
  constituency_promise: string;
  call_to_action: string;
}
interface DefenseClaim {
  attack: string;
  attackCustom: string;
  defense: string;
  inoculation: string;
  loading: boolean;
}

const emptyPromise: Promise = { text: "", why: "", how: "" };
const emptyDefense: DefenseClaim = { attack: "", attackCustom: "", defense: "", inoculation: "", loading: false };

// ─── Completion helpers ───────────────────────────────────────────────────

const isP1Complete = (d: Phase1Data) =>
  !!d.dominantEmotion && !!d.problem1.trim() && !!d.problem2.trim() && !!d.problem3.trim() && !!d.whoBlame && !!d.whatTheyWant.trim() && !!d.currentPerception;

const isP2Complete = (d: Phase2Data) =>
  !!d.candidateIdentity.trim() &&
  (d.contrast === "Custom" ? !!d.contrastCustom.trim() : !!d.contrast) &&
  !!d.positioningStatement.trim() &&
  !!d.oneThing.trim() &&
  (d.vulnerability === "Custom" ? !!d.vulnerabilityCustom.trim() : !!d.vulnerability) &&
  !!d.vulnerabilityCounter.trim();

const isP3Complete = (d: Phase3Data) =>
  d.credibleAdvantages.length > 0 &&
  [d.promise1, d.promise2, d.promise3].every((p) => p.text.trim() && p.why.trim() && p.how.trim()) &&
  !!d.uniquePledge.trim() &&
  !!d.whyNow.trim();

const isP4Complete = (m: Manifesto | null) => !!m && !!m.vision_statement && !!m.call_to_action;

const isP5Complete = (defenses: DefenseClaim[], manifesto: Manifesto | null) => {
  if (!manifesto) return false;
  return defenses.length === 3 && defenses.every((d) => (d.attack === "Custom" ? d.attackCustom.trim() : d.attack) && d.defense.trim());
};

// ─── Main Page ─────────────────────────────────────────────────────────────

function PerceptionsPageContent() {
  const searchParams = useSearchParams();
  const electionType = searchParams.get("election_type") || undefined;
  const labels = useMemo(() => getPerceptionLabels(electionType), [electionType]);

  // Tactical (preserved)
  const [tactical, setTactical] = useState<TacticalData>(defaultTactical);
  const updateTactical = useCallback(
    <K extends keyof TacticalData>(field: K, value: TacticalData[K]) =>
      setTactical((p) => ({ ...p, [field]: value })),
    []
  );

  // 5-Phase state
  const [activePhase, setActivePhase] = useState<PhaseId>(1);
  const [p1, setP1] = useState<Phase1Data>({
    dominantEmotion: "", problem1: "", problem2: "", problem3: "",
    whoBlame: "", whatTheyWant: "", currentPerception: "",
  });
  const [p2, setP2] = useState<Phase2Data>({
    candidateIdentity: "", contrast: "", contrastCustom: "",
    positioningStatement: "", oneThing: "",
    vulnerability: "", vulnerabilityCustom: "", vulnerabilityCounter: "",
  });
  const [p3, setP3] = useState<Phase3Data>({
    credibleAdvantages: [],
    promise1: { ...emptyPromise }, promise2: { ...emptyPromise }, promise3: { ...emptyPromise },
    uniquePledge: "", whyNow: "",
  });
  const [manifesto, setManifesto] = useState<Manifesto | null>(null);
  const [defenses, setDefenses] = useState<DefenseClaim[]>([{ ...emptyDefense }, { ...emptyDefense }, { ...emptyDefense }]);

  // AI outputs
  const [discoverInsight, setDiscoverInsight] = useState("");
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverPrecedent, setDiscoverPrecedent] = useState<string | null>(null);
  const [discoverEntryId, setDiscoverEntryId] = useState<string | null>(null);
  const [defineBrief, setDefineBrief] = useState("");
  const [defineLoading, setDefineLoading] = useState(false);
  const [definePrecedent, setDefinePrecedent] = useState<string | null>(null);
  const [defineEntryId, setDefineEntryId] = useState<string | null>(null);
  const [ideaAudit, setIdeaAudit] = useState("");
  const [ideaLoading, setIdeaLoading] = useState(false);
  const [ideaPrecedent, setIdeaPrecedent] = useState<string | null>(null);
  const [ideaEntryId, setIdeaEntryId] = useState<string | null>(null);
  const [developLoading, setDevelopLoading] = useState(false);
  const [developError, setDevelopError] = useState("");
  const [regenSection, setRegenSection] = useState<string | null>(null);
  const [synthesis, setSynthesis] = useState("");
  const [synthesisLoading, setSynthesisLoading] = useState(false);
  const [synthesisPrecedent, setSynthesisPrecedent] = useState<string | null>(null);
  const [synthesisEntryId, setSynthesisEntryId] = useState<string | null>(null);
  const [modalEntryId, setModalEntryId] = useState<string | null>(null);

  // Response engine (preserved — moved into phase 5B)
  const [responseOptions, setResponseOptions] = useState<{ firm: string; pivot: string; elevate: string } | null>(null);
  const [responseLoading, setResponseLoading] = useState(false);
  const [copiedOption, setCopiedOption] = useState<string | null>(null);
  const responseDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Legacy AI assessment (preserved for tactical section)
  const [aiAssessment, setAiAssessment] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Completion flags
  const p1Done = isP1Complete(p1);
  const p2Done = isP2Complete(p2);
  const p3Done = isP3Complete(p3);
  const p4Done = isP4Complete(manifesto);
  const p5Done = isP5Complete(defenses, manifesto);

  const completed = useMemo(() => {
    const s = new Set<PhaseId>();
    if (p1Done) s.add(1);
    if (p2Done) s.add(2);
    if (p3Done) s.add(3);
    if (p4Done) s.add(4);
    if (p5Done) s.add(5);
    return s;
  }, [p1Done, p2Done, p3Done, p4Done, p5Done]);

  const tacticalUnlocked = p1Done && p2Done && p3Done && p4Done && p5Done;
  const tacticalPhase = getTacticalPhase(tactical.daysRemaining);

  // Read URL params
  useEffect(() => {
    const days = searchParams.get("daysRemaining");
    if (days) updateTactical("daysRemaining", parseInt(days) || 0);
  }, [searchParams, updateTactical]);

  // Auto pre-fill positioning statement template
  useEffect(() => {
    if (!p2.positioningStatement && p1.dominantEmotion && p1.currentPerception) {
      const emotionWord = p1.dominantEmotion.split(" — ")[0]?.toLowerCase() || "";
      setP2((prev) => ({
        ...prev,
        positioningStatement: `For [voter group] who feel ${emotionWord}, [candidate name] is the [type of leader] who [unique differentiator] unlike [main opponent] who [contrast].`,
      }));
    }
  }, [p1.dominantEmotion, p1.currentPerception, p2.positioningStatement]);

  // DISCOVER → call API when complete
  useEffect(() => {
    if (!p1Done) return;
    const t = setTimeout(async () => {
      setDiscoverLoading(true);
      try {
        const res = await fetch("/api/strategy/perceptions/discover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            election_type: electionType,
            dominant_emotion: p1.dominantEmotion,
            problem_1: p1.problem1,
            problem_2: p1.problem2,
            problem_3: p1.problem3,
            who_they_blame: p1.whoBlame,
            what_they_want_most: p1.whatTheyWant,
            current_perception: p1.currentPerception,
          }),
        });
        const j = await res.json();
        setDiscoverInsight(j.insight || j.error || "No insight returned.");
        setDiscoverPrecedent(j.precedent || null);
        setDiscoverEntryId(j.precedent_entry_id || null);
      } catch {
        setDiscoverInsight("Connection error generating DISCOVER insight.");
      } finally {
        setDiscoverLoading(false);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [p1, p1Done, electionType]);

  // DEFINE → call API
  useEffect(() => {
    if (!p2Done) return;
    const t = setTimeout(async () => {
      setDefineLoading(true);
      try {
        const res = await fetch("/api/strategy/perceptions/define", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            election_type: electionType,
            candidate_identity: p2.candidateIdentity,
            contrast: p2.contrast === "Custom" ? p2.contrastCustom : p2.contrast,
            positioning_statement: p2.positioningStatement,
            one_thing: p2.oneThing,
            vulnerability: p2.vulnerability === "Custom" ? p2.vulnerabilityCustom : p2.vulnerability,
            vulnerability_counter: p2.vulnerabilityCounter,
            discover_context: discoverInsight,
          }),
        });
        const j = await res.json();
        setDefineBrief(j.brief || j.error || "No brief returned.");
        setDefinePrecedent(j.precedent || null);
        setDefineEntryId(j.precedent_entry_id || null);
      } catch {
        setDefineBrief("Connection error generating DEFINE brief.");
      } finally {
        setDefineLoading(false);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [p2, p2Done, electionType, discoverInsight]);

  // IDEA → call API
  useEffect(() => {
    if (!p3Done) return;
    const t = setTimeout(async () => {
      setIdeaLoading(true);
      try {
        const res = await fetch("/api/strategy/perceptions/idea", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            election_type: electionType,
            credible_advantages: p3.credibleAdvantages,
            promise_1: `${p3.promise1.text} | why me: ${p3.promise1.why} | proof: ${p3.promise1.how}`,
            promise_2: `${p3.promise2.text} | why me: ${p3.promise2.why} | proof: ${p3.promise2.how}`,
            promise_3: `${p3.promise3.text} | why me: ${p3.promise3.why} | proof: ${p3.promise3.how}`,
            unique_pledge: p3.uniquePledge,
            why_now: p3.whyNow,
            discover_context: discoverInsight,
            define_context: defineBrief,
          }),
        });
        const j = await res.json();
        setIdeaAudit(j.audit || j.error || "No audit returned.");
        setIdeaPrecedent(j.precedent || null);
        setIdeaEntryId(j.precedent_entry_id || null);
      } catch {
        setIdeaAudit("Connection error generating IDEA audit.");
      } finally {
        setIdeaLoading(false);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [p3, p3Done, electionType, discoverInsight, defineBrief]);

  // DEVELOP — manifesto generation (manual)
  const developPayload = useCallback(() => ({
    election_type: electionType,
    dominant_emotion: p1.dominantEmotion,
    problem_1: p1.problem1,
    problem_2: p1.problem2,
    problem_3: p1.problem3,
    who_they_blame: p1.whoBlame,
    what_they_want_most: p1.whatTheyWant,
    current_perception: p1.currentPerception,
    candidate_identity: p2.candidateIdentity,
    contrast: p2.contrast === "Custom" ? p2.contrastCustom : p2.contrast,
    positioning_statement: p2.positioningStatement,
    one_thing: p2.oneThing,
    vulnerability: p2.vulnerability === "Custom" ? p2.vulnerabilityCustom : p2.vulnerability,
    vulnerability_counter: p2.vulnerabilityCounter,
    credible_advantages: p3.credibleAdvantages,
    promise_1: p3.promise1.text,
    promise_2: p3.promise2.text,
    promise_3: p3.promise3.text,
    unique_pledge: p3.uniquePledge,
    why_now: p3.whyNow,
  }), [electionType, p1, p2, p3]);

  async function generateManifesto() {
    setDevelopLoading(true);
    setDevelopError("");
    try {
      const res = await fetch("/api/strategy/perceptions/develop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(developPayload()),
      });
      const j = await res.json();
      if (j.manifesto) setManifesto(j.manifesto);
      else setDevelopError(j.error || "Manifesto generation failed.");
    } catch {
      setDevelopError("Connection error generating manifesto.");
    } finally {
      setDevelopLoading(false);
    }
  }

  async function regenerateSection(section: keyof Manifesto) {
    if (!manifesto) return;
    setRegenSection(section);
    try {
      const res = await fetch("/api/strategy/perceptions/develop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...developPayload(),
          regenerate_section: section,
          existing_manifesto: manifesto,
        }),
      });
      const j = await res.json();
      if (j.value !== undefined && j.value !== null) {
        setManifesto({ ...manifesto, [section]: j.value } as Manifesto);
      }
    } catch {
      // silent
    } finally {
      setRegenSection(null);
    }
  }

  // MEASURE — inoculation trigger per defense
  async function generateInoculation(idx: number) {
    const d = defenses[idx];
    const pledgeText = manifesto ? (manifesto[`pledge_${idx + 1}` as "pledge_1" | "pledge_2" | "pledge_3"]?.commitment || "") : "";
    setDefenses((prev) => prev.map((x, i) => i === idx ? { ...x, loading: true } : x));
    try {
      const res = await fetch("/api/strategy/perceptions/inoculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pledge: pledgeText,
          attack: d.attack === "Custom" ? d.attackCustom : d.attack,
          defense: d.defense,
        }),
      });
      const j = await res.json();
      setDefenses((prev) => prev.map((x, i) => i === idx ? { ...x, inoculation: j.inoculation || j.error || "", loading: false } : x));
    } catch {
      setDefenses((prev) => prev.map((x, i) => i === idx ? { ...x, loading: false, inoculation: "Connection error." } : x));
    }
  }

  // Response Engine (preserved)
  useEffect(() => {
    if (tactical.activeAttack && tactical.attackDescription.length > 10 && tactical.attackSeverity) {
      if (responseDebounceRef.current) clearTimeout(responseDebounceRef.current);
      responseDebounceRef.current = setTimeout(async () => {
        setResponseLoading(true);
        try {
          const res = await fetch("/api/strategy/response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              attackDescription: tactical.attackDescription,
              severity: tactical.attackSeverity,
              voterPerception: tactical.voterPerception || p1.currentPerception,
              positioning: tactical.positioning || p2.positioningStatement,
              daysRemaining: tactical.daysRemaining,
            }),
          });
          const j = await res.json();
          setResponseOptions(j.responses || null);
        } catch {
          setResponseOptions(null);
        } finally {
          setResponseLoading(false);
        }
      }, 1200);
    } else {
      setResponseOptions(null);
    }
  }, [tactical.activeAttack, tactical.attackDescription, tactical.attackSeverity, tactical.voterPerception, tactical.positioning, tactical.daysRemaining, p1.currentPerception, p2.positioningStatement]);

  // Legacy AI Perception Assessment (for tactical)
  useEffect(() => {
    if (tactical.voterPerception && tactical.daysRemaining > 0) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setAiLoading(true);
        try {
          const res = await fetch("/api/strategy/perceptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...tactical,
              phase: tacticalPhase,
              channelCount: tactical.communityChannels.length,
              election_type: electionType,
            }),
          });
          const j = await res.json();
          setAiAssessment(j.assessment || "Unable to generate assessment.");
        } catch {
          setAiAssessment("Connection error.");
        } finally {
          setAiLoading(false);
        }
      }, 1200);
    }
  }, [tactical, tacticalPhase, electionType]);

  // Narrative Stress Test Score
  const stressScore = useMemo(() => {
    let s = 0;
    defenses.forEach((d) => { if (d.defense.trim()) s += 15; });
    defenses.forEach((d) => { if (d.inoculation.trim()) s += 10; });
    if (p2.vulnerability && p2.vulnerabilityCounter.trim()) s += 15;
    if (tactical.activeAttack && tactical.attackDescription.trim() && tactical.attackSeverity) s += 20;
    return Math.min(100, s);
  }, [defenses, p2.vulnerability, p2.vulnerabilityCounter, tactical.activeAttack, tactical.attackDescription, tactical.attackSeverity]);

  const stressBand = useMemo(() => {
    if (stressScore >= 80) return { label: "BATTLE-READY", color: "var(--green)", interp: "Your narrative holds together, your defenses are prepared, and your counter-narrative is operational — you can enter hostile terrain." };
    if (stressScore >= 60) return { label: "MOSTLY PREPARED", color: "var(--amber)", interp: "Your core narrative is coherent but one or two pledges lack defensive hardening — a smart opponent will find the seam." };
    if (stressScore >= 40) return { label: "GAPS REMAIN", color: "var(--amber)", interp: "You have the positioning but not the armour — multiple pledges are undefended and the first attack will land." };
    return { label: "EXPOSED", color: "var(--red)", interp: "Your narrative is visible but unprotected — do not launch until defense claims and inoculations are completed." };
  }, [stressScore]);

  const weakestPoint = useMemo(() => {
    const noDefense = defenses.findIndex((d) => !d.defense.trim());
    if (noDefense >= 0) return `Pledge ${noDefense + 1} has no defense prepared — this is your most immediate vulnerability.`;
    const noInoc = defenses.findIndex((d) => !d.inoculation.trim());
    if (noInoc >= 0) return `Pledge ${noInoc + 1} has a defense but no inoculation statement — you will respond to attacks instead of pre-empting them.`;
    if (!tactical.activeAttack) return `Response Engine not configured — you have no rehearsed rapid response for real-time attacks.`;
    if (!p2.vulnerabilityCounter.trim()) return `Positioning vulnerability has no counter — the DEFINE phase left a flank unguarded.`;
    return `No single weak point identified — continue pressure-testing with real attacks as they emerge.`;
  }, [defenses, tactical.activeAttack, p2.vulnerabilityCounter]);

  // Synthesis
  async function generateSynthesis() {
    setSynthesisLoading(true);
    try {
      const res = await fetch("/api/strategy/perceptions/synthesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          election_type: electionType,
          dominant_emotion: p1.dominantEmotion,
          problem_1: p1.problem1,
          problem_2: p1.problem2,
          problem_3: p1.problem3,
          who_they_blame: p1.whoBlame,
          what_they_want_most: p1.whatTheyWant,
          current_perception: p1.currentPerception,
          discover_insight: discoverInsight,
          candidate_identity: p2.candidateIdentity,
          contrast: p2.contrast === "Custom" ? p2.contrastCustom : p2.contrast,
          positioning_statement: p2.positioningStatement,
          one_thing: p2.oneThing,
          vulnerability: p2.vulnerability === "Custom" ? p2.vulnerabilityCustom : p2.vulnerability,
          vulnerability_counter: p2.vulnerabilityCounter,
          define_brief: defineBrief,
          credible_advantages: p3.credibleAdvantages,
          promise_1: p3.promise1.text,
          promise_2: p3.promise2.text,
          promise_3: p3.promise3.text,
          unique_pledge: p3.uniquePledge,
          why_now: p3.whyNow,
          idea_audit: ideaAudit,
          manifesto,
          defense_claims: defenses.map((d, i) => `Pledge ${i + 1}: attack="${d.attack === "Custom" ? d.attackCustom : d.attack}" defense="${d.defense}"`),
          inoculations: defenses.map((d, i) => `Pledge ${i + 1}: ${d.inoculation}`),
          stress_score: stressScore,
        }),
      });
      const j = await res.json();
      setSynthesis(j.assessment || j.synthesis || j.error || "");
      setSynthesisPrecedent(j.precedent || null);
      setSynthesisEntryId(j.precedent_entry_id || null);
    } catch {
      setSynthesis("Connection error generating synthesis.");
    } finally {
      setSynthesisLoading(false);
    }
  }

  const copyToClipboard = (text: string, k: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOption(k);
    setTimeout(() => setCopiedOption(null), 2000);
  };

  const getSeverityBorder = () => {
    if (tactical.attackSeverity.includes("Severe")) return "border-[var(--red)]";
    if (tactical.attackSeverity.includes("Moderate")) return "border-[var(--amber)]";
    return "border-[var(--gold-border)]";
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8 print:px-0 print:py-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 print:hidden"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[var(--gold-dim)]">
            <Flame size={20} className="text-[var(--gold)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Managing Perceptions</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Framework 5 — Brand Narrative Builder & Tactical Deployment
            </p>
          </div>
        </div>
      </motion.div>

      {/* Phase Tracker */}
      <div className="print:hidden">
        <PhaseTracker active={activePhase} completed={completed} onJump={setActivePhase} />
      </div>

      {/* ═══════════════ SECTION 1 — BRAND NARRATIVE BUILDER ═══════════════ */}
      <div className="print:hidden">
        {/* PHASE 1 — DISCOVER */}
        <PhaseSection phase={1} active={activePhase}>
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5 space-y-5">
            <RadioCards
              label={`Block 1 — ${labels.dominantEmotion}`}
              options={dominantEmotionOptions}
              value={p1.dominantEmotion}
              onChange={(v) => setP1({ ...p1, dominantEmotion: v })}
              columns={2}
            />
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-2">Block 2 — {labels.problemStatements}</label>
              <div className="space-y-3">
                <TextInput label="Problem 1 — The most urgent, felt daily" value={p1.problem1} onChange={(v) => setP1({ ...p1, problem1: v })} placeholder="e.g. Muar floods every monsoon, homes destroyed, no compensation" />
                <TextInput label="Problem 2 — The systemic issue they've given up expecting to be solved" value={p1.problem2} onChange={(v) => setP1({ ...p1, problem2: v })} placeholder="e.g. No real jobs here, young people forced to move to KL or Singapore" />
                <TextInput label="Problem 3 — The aspirational gap — what they want but don't have" value={p1.problem3} onChange={(v) => setP1({ ...p1, problem3: v })} placeholder="e.g. A government that actually shows up and listens" />
              </div>
            </div>
            <RadioCards
              label={`Block 3 — ${labels.whoTheyBlame}`}
              options={blameOptions}
              value={p1.whoBlame}
              onChange={(v) => setP1({ ...p1, whoBlame: v })}
              columns={2}
            />
            <TextInput
              label={`Block 4 — ${labels.whatTheyWant} (max 100 chars)`}
              value={p1.whatTheyWant}
              onChange={(v) => setP1({ ...p1, whatTheyWant: v })}
              placeholder="e.g. actually fix the roads"
              maxLength={100}
            />
            <RadioCards
              label={`Block 5 — ${labels.currentPerception}`}
              options={currentPerceptionOptions}
              value={p1.currentPerception}
              onChange={(v) => setP1({ ...p1, currentPerception: v })}
              columns={3}
            />
          </div>

          <AIOutputCard
            title="DISCOVER INTELLIGENCE · AI INSIGHT"
            content={discoverInsight}
            loading={discoverLoading}
            provenance="Grounded in: Murray Edelman · The Symbolic Uses of Politics (1964)"
            precedent={discoverPrecedent}
            entryId={discoverEntryId}
            onOpenModal={setModalEntryId}
          />

          <div className="flex justify-end">
            <button
              disabled={!p1Done}
              onClick={() => setActivePhase(2)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                p1Done
                  ? "bg-[var(--gold)] text-black hover:bg-[#E8961C] gold-glow"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed"
              }`}
            >
              Continue to DEFINE <ArrowRight size={14} />
            </button>
          </div>
        </PhaseSection>

        {/* PHASE 2 — DEFINE */}
        <PhaseSection phase={2} active={activePhase}>
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5 space-y-5">
            <TextInput
              label={`Block 1 — ${labels.iAmThe} (max 80 chars)`}
              value={p2.candidateIdentity}
              onChange={(v) => setP2({ ...p2, candidateIdentity: v })}
              placeholder="e.g. came back to Muar when others left"
              maxLength={80}
            />
            <RadioCards
              label={`Block 2 — ${labels.contrast}`}
              options={contrastOptions}
              value={p2.contrast}
              onChange={(v) => setP2({ ...p2, contrast: v })}
              columns={2}
            />
            {p2.contrast === "Custom" && (
              <TextInput label="Custom contrast" value={p2.contrastCustom} onChange={(v) => setP2({ ...p2, contrastCustom: v })} placeholder="Describe the contrast you want to own" />
            )}
            <TextArea
              label={`Block 3 — ${labels.positioningStatement}`}
              value={p2.positioningStatement}
              onChange={(v) => setP2({ ...p2, positioningStatement: v })}
              placeholder="For [voter group] who feel [emotion], [candidate name] is the [type of leader] who [unique differentiator] unlike [main opponent] who [contrast]."
              rows={4}
            />
            <TextInput
              label={`Block 4 — ${labels.theOneThing} (max 60 chars)`}
              value={p2.oneThing}
              onChange={(v) => setP2({ ...p2, oneThing: v })}
              placeholder="The single sentence voters will remember"
              maxLength={60}
            />
            <RadioCards
              label={`Block 5 — ${labels.vulnerability}`}
              options={vulnerabilityOptions}
              value={p2.vulnerability}
              onChange={(v) => setP2({ ...p2, vulnerability: v })}
              columns={2}
            />
            {p2.vulnerability === "Custom" && (
              <TextInput label="Custom vulnerability" value={p2.vulnerabilityCustom} onChange={(v) => setP2({ ...p2, vulnerabilityCustom: v })} />
            )}
            <TextInput
              label="Counter — how you neutralise this vulnerability"
              value={p2.vulnerabilityCounter}
              onChange={(v) => setP2({ ...p2, vulnerabilityCounter: v })}
              placeholder="e.g. Young, yes — but I spent 15 years running a business here"
            />
          </div>

          <AIOutputCard
            title="DEFINE INTELLIGENCE · AI POSITIONING BRIEF"
            content={defineBrief}
            loading={defineLoading}
            provenance="Grounded in: Machiavelli · The Prince (1532) · Anthony Downs (1957)"
            precedent={definePrecedent}
            entryId={defineEntryId}
            onOpenModal={setModalEntryId}
          />

          <div className="flex justify-between">
            <button onClick={() => setActivePhase(1)} className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
              ← Back to DISCOVER
            </button>
            <button
              disabled={!p2Done}
              onClick={() => setActivePhase(3)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                p2Done
                  ? "bg-[var(--gold)] text-black hover:bg-[#E8961C] gold-glow"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed"
              }`}
            >
              Continue to IDEA <ArrowRight size={14} />
            </button>
          </div>
        </PhaseSection>

        {/* PHASE 3 — IDEA */}
        <PhaseSection phase={3} active={activePhase}>
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5 space-y-5">
            <CheckboxGrid
              label={`Block 1 — ${labels.credibleAdvantages} (select all that apply)`}
              options={credibleAdvantageOptions}
              values={p3.credibleAdvantages}
              onChange={(v) => setP3({ ...p3, credibleAdvantages: v })}
              columns={2}
            />
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-2">Block 2 — {labels.threePromises}</label>
              <div className="space-y-4">
                {([1, 2, 3] as const).map((n) => {
                  const key = `promise${n}` as "promise1" | "promise2" | "promise3";
                  const promise = p3[key];
                  return (
                    <div key={n} className="bg-[var(--bg-elevated)] rounded-lg p-4 space-y-3 border border-[rgba(255,255,255,0.04)]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--gold)]">PROMISE {n}</span>
                      </div>
                      <TextInput label="Promise text" value={promise.text} onChange={(v) => setP3({ ...p3, [key]: { ...promise, text: v } })} placeholder="The specific commitment" />
                      <TextInput label="Why you specifically can deliver" value={promise.why} onChange={(v) => setP3({ ...p3, [key]: { ...promise, why: v } })} placeholder="Your unique qualification" />
                      <TextInput label="How voters will know it's done" value={promise.how} onChange={(v) => setP3({ ...p3, [key]: { ...promise, how: v } })} placeholder="The visible, measurable outcome" />
                    </div>
                  );
                })}
              </div>
            </div>
            <TextArea
              label={`Block 3 — ${labels.constituencyPledge}`}
              value={p3.uniquePledge}
              onChange={(v) => setP3({ ...p3, uniquePledge: v })}
              placeholder="e.g. I will hold open JPS meetings every month in Muar to review flood mitigation progress publicly"
              rows={4}
            />
            <TextInput
              label={`Block 4 — ${labels.whyNow} (max 120 chars)`}
              value={p3.whyNow}
              onChange={(v) => setP3({ ...p3, whyNow: v })}
              placeholder="Why this election, why this moment"
              maxLength={120}
            />
          </div>

          <AIOutputCard
            title="IDEA INTELLIGENCE · VALUE PROPOSITION AUDIT"
            content={ideaAudit}
            loading={ideaLoading}
            provenance="Grounded in: Saul Alinsky · Rules for Radicals (1971)"
            precedent={ideaPrecedent}
            entryId={ideaEntryId}
            onOpenModal={setModalEntryId}
          />

          <div className="flex justify-between">
            <button onClick={() => setActivePhase(2)} className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
              ← Back to DEFINE
            </button>
            <button
              disabled={!p3Done}
              onClick={() => setActivePhase(4)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                p3Done
                  ? "bg-[var(--gold)] text-black hover:bg-[#E8961C] gold-glow"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed"
              }`}
            >
              Continue to DEVELOP <ArrowRight size={14} />
            </button>
          </div>
        </PhaseSection>

        {/* PHASE 4 — DEVELOP */}
        <PhaseSection phase={4} active={activePhase}>
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            {!manifesto ? (
              <div className="py-6 flex flex-col items-center gap-4">
                <p className="text-sm text-[var(--text-secondary)] text-center max-w-md">
                  Your DISCOVER, DEFINE, and IDEA inputs are ready to be synthesised into a complete manifesto.
                </p>
                <button
                  onClick={generateManifesto}
                  disabled={developLoading}
                  className="px-6 py-3 rounded-lg bg-[var(--gold)] text-black text-sm font-semibold hover:bg-[#E8961C] gold-glow flex items-center gap-2 disabled:opacity-60"
                >
                  {developLoading ? (
                    <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Generating…</>
                  ) : (
                    <><Sparkles size={14} /> Generate Manifesto <ArrowRight size={14} /></>
                  )}
                </button>
                {developError && <p className="text-xs text-[var(--red)]">{developError}</p>}
              </div>
            ) : (
              <div className="space-y-4" id="manifesto-print">
                <ManifestoCard
                  section="vision_statement"
                  title="Vision Statement"
                  value={manifesto.vision_statement}
                  onChange={(v) => setManifesto({ ...manifesto, vision_statement: v })}
                  onRegenerate={() => regenerateSection("vision_statement")}
                  regenerating={regenSection === "vision_statement"}
                />
                <ManifestoCard
                  section="who_i_am"
                  title="Who I Am"
                  value={manifesto.who_i_am}
                  onChange={(v) => setManifesto({ ...manifesto, who_i_am: v })}
                  onRegenerate={() => regenerateSection("who_i_am")}
                  regenerating={regenSection === "who_i_am"}
                  multiline
                />
                <div className="bg-[var(--bg-elevated)] rounded-lg p-5 border border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-[var(--gold)]">Three Pledges</h4>
                  </div>
                  <div className="space-y-3">
                    {([1, 2, 3] as const).map((n) => {
                      const key = `pledge_${n}` as "pledge_1" | "pledge_2" | "pledge_3";
                      const pledge = manifesto[key];
                      return (
                        <div key={n} className="bg-[var(--bg-surface)] rounded-lg p-4 border border-[rgba(255,255,255,0.04)]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[var(--gold)]">PLEDGE {n}</span>
                            <button
                              onClick={() => regenerateSection(key)}
                              className="text-[11px] text-[var(--text-muted)] hover:text-[var(--gold)] flex items-center gap-1"
                            >
                              {regenSection === key ? (
                                <div className="w-3 h-3 border border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <RefreshCw size={11} />
                              )}
                              Regenerate
                            </button>
                          </div>
                          <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Commitment</label>
                          <InlineEditable
                            value={pledge.commitment}
                            onChange={(v) => setManifesto({ ...manifesto, [key]: { ...pledge, commitment: v } } as Manifesto)}
                            className="text-sm text-white mb-2"
                          />
                          <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Accountability</label>
                          <InlineEditable
                            value={pledge.accountability}
                            onChange={(v) => setManifesto({ ...manifesto, [key]: { ...pledge, accountability: v } } as Manifesto)}
                            className="text-sm text-[var(--text-secondary)]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <ManifestoCard
                  section="constituency_promise"
                  title="Constituency Promise"
                  value={manifesto.constituency_promise}
                  onChange={(v) => setManifesto({ ...manifesto, constituency_promise: v })}
                  onRegenerate={() => regenerateSection("constituency_promise")}
                  regenerating={regenSection === "constituency_promise"}
                  multiline
                />
                <ManifestoCard
                  section="call_to_action"
                  title="Call to Action"
                  value={manifesto.call_to_action}
                  onChange={(v) => setManifesto({ ...manifesto, call_to_action: v })}
                  onRegenerate={() => regenerateSection("call_to_action")}
                  regenerating={regenSection === "call_to_action"}
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={generateManifesto}
                    disabled={developLoading}
                    className="px-4 py-2 rounded-lg border border-[var(--gold-border)] text-[var(--gold)] text-xs font-medium hover:bg-[var(--gold-dim)] flex items-center gap-2 disabled:opacity-60"
                  >
                    <RefreshCw size={12} /> Regenerate entire manifesto
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-lg bg-[var(--gold)] text-black text-xs font-semibold hover:bg-[#E8961C] flex items-center gap-2 gold-glow"
                  >
                    <Printer size={12} /> Download Manifesto as PDF →
                  </button>
                </div>
              </div>
            )}
          </div>

          <AIOutputCard
            title="DEVELOP INTELLIGENCE · MANIFESTO BRIEF"
            content={manifesto ? "Manifesto structure generated successfully. Each section is editable inline — click any text to refine it. Use per-section regenerate to iterate without losing other work." : ""}
            loading={developLoading}
            provenance="Grounded in: Jennifer Lees-Marshment · Political Marketing (2009)"
          />

          <div className="flex justify-between">
            <button onClick={() => setActivePhase(3)} className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
              ← Back to IDEA
            </button>
            <button
              disabled={!p4Done}
              onClick={() => setActivePhase(5)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                p4Done
                  ? "bg-[var(--gold)] text-black hover:bg-[#E8961C] gold-glow"
                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed"
              }`}
            >
              Continue to MEASURE <ArrowRight size={14} />
            </button>
          </div>
        </PhaseSection>

        {/* PHASE 5 — MEASURE */}
        <PhaseSection phase={5} active={activePhase}>
          {/* 5A Defense Claims */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h4 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
              <Shield size={14} /> 5A — Defense Claims (one per pledge)
            </h4>
            {!manifesto ? (
              <p className="text-sm text-[var(--text-muted)]">Generate your manifesto in DEVELOP first — defenses attach to each pledge.</p>
            ) : (
              <div className="space-y-4">
                {([1, 2, 3] as const).map((n) => {
                  const idx = n - 1;
                  const d = defenses[idx];
                  const pledgeKey = `pledge_${n}` as "pledge_1" | "pledge_2" | "pledge_3";
                  const pledgeCommitment = manifesto[pledgeKey]?.commitment || "";
                  return (
                    <div key={n} className="bg-[var(--bg-elevated)] rounded-lg p-4 space-y-3 border border-[rgba(255,255,255,0.04)]">
                      <div>
                        <span className="text-xs font-bold text-[var(--gold)]">PLEDGE {n}</span>
                        <p className="text-sm text-white mt-1">{pledgeCommitment}</p>
                      </div>
                      <RadioCards
                        label="Most likely attack"
                        options={attackOptions}
                        value={d.attack}
                        onChange={(v) => setDefenses((prev) => prev.map((x, i) => i === idx ? { ...x, attack: v } : x))}
                        columns={2}
                      />
                      {d.attack === "Custom" && (
                        <TextInput label="Custom attack" value={d.attackCustom} onChange={(v) => setDefenses((prev) => prev.map((x, i) => i === idx ? { ...x, attackCustom: v } : x))} />
                      )}
                      <TextInput
                        label="Your defense"
                        value={d.defense}
                        onChange={(v) => setDefenses((prev) => prev.map((x, i) => i === idx ? { ...x, defense: v } : x))}
                        placeholder="The factual rebuttal or reframe"
                      />
                      <button
                        onClick={() => generateInoculation(idx)}
                        disabled={!d.defense.trim() || (d.attack === "Custom" ? !d.attackCustom.trim() : !d.attack) || d.loading}
                        className="px-3 py-1.5 rounded-lg bg-[var(--gold-dim)] text-[var(--gold)] border border-[var(--gold-border)] text-xs font-medium hover:bg-[var(--gold)] hover:text-black transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {d.loading ? (
                          <><div className="w-3 h-3 border border-[var(--gold)] border-t-transparent rounded-full animate-spin" /> Generating…</>
                        ) : (
                          <><Sparkles size={12} /> Generate Inoculation Statement</>
                        )}
                      </button>
                      {d.inoculation && (
                        <div className="bg-[var(--bg-surface)] rounded-lg p-3 border-l-2 border-[var(--gold)]">
                          <p className="text-[10px] text-[var(--gold)] uppercase tracking-wider mb-1">Inoculation</p>
                          <p className="text-sm text-white leading-relaxed">{d.inoculation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5B In-Situational Response Engine (preserved) */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h4 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
              <AlertTriangle size={14} /> 5B — In-Situational Response Engine
            </h4>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-2">Active opponent attacks?</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateTactical("activeAttack", true)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      tactical.activeAttack
                        ? "bg-[rgba(239,68,68,0.15)] text-[var(--red)] border-[rgba(239,68,68,0.3)]"
                        : "bg-transparent text-[var(--text-secondary)] border-[rgba(255,255,255,0.1)] hover:border-[var(--gold-border)]"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => { updateTactical("activeAttack", false); updateTactical("attackDescription", ""); updateTactical("attackSeverity", ""); }}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      !tactical.activeAttack
                        ? "bg-[rgba(34,197,94,0.15)] text-[var(--green)] border-[rgba(34,197,94,0.3)]"
                        : "bg-transparent text-[var(--text-secondary)] border-[rgba(255,255,255,0.1)] hover:border-[var(--gold-border)]"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
              {tactical.activeAttack && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <TextArea
                    label="Describe the attack"
                    value={tactical.attackDescription}
                    onChange={(v) => updateTactical("attackDescription", v)}
                    placeholder="What is the opponent saying or doing?"
                    rows={3}
                    maxLength={200}
                  />
                  <RadioCards
                    label="Severity"
                    options={severityOptions}
                    value={tactical.attackSeverity}
                    onChange={(v) => updateTactical("attackSeverity", v)}
                  />
                </motion.div>
              )}
              {tactical.activeAttack && (
                <div className={`bg-[var(--bg-elevated)] rounded-xl border-2 p-4 transition-colors ${getSeverityBorder()}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} className={tactical.attackSeverity.includes("Severe") ? "text-[var(--red)]" : "text-[var(--amber)]"} />
                    <span className="text-xs font-bold tracking-wider" style={{ color: tactical.attackSeverity.includes("Severe") ? "var(--red)" : "var(--amber)" }}>
                      RESPONSE BRIEF — AI GENERATED
                    </span>
                  </div>
                  {responseLoading ? (
                    <div className="flex items-center gap-3 py-4">
                      <div className="w-4 h-4 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-[var(--text-secondary)]">Generating response options…</span>
                    </div>
                  ) : responseOptions ? (
                    <div className="space-y-3">
                      {([
                        { key: "firm", label: "FIRM", icon: Target, desc: "Direct factual rebuttal" },
                        { key: "pivot", label: "PIVOT", icon: Megaphone, desc: "Redirect and elevate" },
                        { key: "elevate", label: "ELEVATE", icon: Zap, desc: "Rise above entirely" },
                      ] as const).map(({ key, label, icon: Icon, desc }) => (
                        <div key={key} className="bg-[var(--bg-surface)] rounded-lg p-3 flex items-start gap-3">
                          <div className="p-1.5 rounded-lg bg-[var(--bg-base)]">
                            <Icon size={13} className="text-[var(--gold)]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-[var(--gold)]">{label}</span>
                              <span className="text-[10px] text-[var(--text-muted)]">{desc}</span>
                            </div>
                            <p className="text-sm text-white leading-relaxed">{responseOptions[key]}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(responseOptions[key], key)}
                            className="p-2 rounded-lg hover:bg-[var(--bg-base)] transition-colors text-[var(--text-muted)] hover:text-[var(--gold)]"
                          >
                            {copiedOption === key ? <Check size={14} className="text-[var(--green)]" /> : <Copy size={14} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">
                      {tactical.attackDescription.length <= 10
                        ? "Describe the attack in detail (minimum 10 characters) and select severity to generate response options."
                        : !tactical.attackSeverity
                          ? "Select attack severity to generate response options."
                          : "Generating…"}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 5C Narrative Stress Test Score */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h4 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
              <Gauge size={14} /> 5C — Narrative Stress Test Score
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <StressGauge score={stressScore} color={stressBand.color} label={stressBand.label} />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">What your score means</p>
                  <p className="text-sm text-white">{stressBand.interp}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Weakest point</p>
                  <p className="text-sm text-[var(--amber)]">{weakestPoint}</p>
                </div>
              </div>
            </div>
          </div>

          <AIOutputCard
            title="MEASURE INTELLIGENCE · DEFENSE READINESS"
            content={
              stressScore === 0
                ? ""
                : `Stress score ${stressScore}/100 · ${stressBand.label}. ${defenses.filter((d) => d.inoculation).length}/3 pledges fully inoculated. Response engine ${tactical.activeAttack ? "active" : "on standby"}.`
            }
            loading={false}
            provenance="Grounded in: V.O. Key Jr. · Southern Politics (1949) · Lasswell (1936)"
          />

          <div className="flex justify-between">
            <button onClick={() => setActivePhase(4)} className="px-4 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
              ← Back to DEVELOP
            </button>
            {p5Done && (
              <div className="text-xs text-[var(--green)] flex items-center gap-2 font-semibold">
                <CheckCircle2 size={14} /> All 5 phases complete — tactical deployment unlocked below.
              </div>
            )}
          </div>
        </PhaseSection>

        {/* ═══════════ NARRATIVE INTELLIGENCE SYNTHESIS ═══════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-8 bg-[var(--bg-surface)] rounded-xl border-2 border-[var(--gold-border)] p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ background: "linear-gradient(135deg, var(--gold), transparent)" }} />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[var(--gold-dim)]">
                <Sparkles size={18} className="text-[var(--gold)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Narrative Intelligence Synthesis</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Senior strategist&apos;s integrated read across all five phases
                </p>
              </div>
            </div>

            {!synthesis && !synthesisLoading && (
              <button
                onClick={generateSynthesis}
                disabled={!(p1Done && p2Done && p3Done && p4Done)}
                className="px-5 py-2.5 rounded-lg bg-[var(--gold)] text-black text-sm font-semibold hover:bg-[#E8961C] gold-glow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={14} /> Generate Narrative Intelligence Assessment
              </button>
            )}
            {synthesisLoading && (
              <div className="flex items-center gap-3 py-2">
                <div className="w-4 h-4 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-[var(--text-secondary)]">Synthesising across phases…</span>
              </div>
            )}
            {synthesis && (
              <div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{synthesis}</p>
                {synthesisPrecedent && (
                  <PrecedentPulse precedent={synthesisPrecedent} entryId={synthesisEntryId} onOpenModal={setModalEntryId} />
                )}
                <button
                  onClick={generateSynthesis}
                  className="mt-3 text-xs text-[var(--gold)] hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={11} /> Regenerate
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ═══════════════ SECTION 2 — TACTICAL DEPLOYMENT ═══════════════ */}
      <div className="mt-10 print:hidden">
        {/* Narrative Readiness Checklist */}
        <div className={`bg-[var(--bg-surface)] rounded-xl border p-5 mb-6 ${tacticalUnlocked ? "border-[var(--gold-border)]" : "border-[rgba(255,255,255,0.06)]"}`}>
          <h3 className="text-sm font-semibold text-[var(--gold)] mb-3 flex items-center gap-2">
            <CheckCircle2 size={14} /> Narrative Readiness Checklist
          </h3>
          <div className="flex flex-wrap gap-3">
            {PHASES.map((phase) => {
              const done = completed.has(phase.id);
              return (
                <button
                  key={phase.id}
                  onClick={() => setActivePhase(phase.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-all ${
                    done
                      ? "border-[var(--green)] text-[var(--green)] bg-[rgba(34,197,94,0.1)]"
                      : "border-[rgba(255,255,255,0.1)] text-[var(--text-muted)] hover:border-[var(--gold-border)] hover:text-[var(--gold)]"
                  }`}
                >
                  {done ? <Check size={11} /> : <Lock size={11} />}
                  {phase.label}
                </button>
              );
            })}
            <div className={`ml-auto text-xs font-semibold ${tacticalUnlocked ? "text-[var(--green)]" : "text-[var(--text-muted)]"}`}>
              {tacticalUnlocked ? "→ Ready to deploy" : `${completed.size}/5 complete — finish phases to unlock deployment`}
            </div>
          </div>
        </div>

        {tacticalUnlocked ? (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8">
            {/* LEFT — Tactical Inputs */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Candidate Brand */}
              <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
                <h3 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
                  <Eye size={14} /> Candidate Brand (Tactical)
                </h3>
                <div className="space-y-5">
                  <RadioCards label="Current voter perception" options={perceptionOptions} value={tactical.voterPerception} onChange={(v) => updateTactical("voterPerception", v)} />
                  <TextInput label="One-sentence positioning" value={tactical.positioning} onChange={(v) => updateTactical("positioning", v)} placeholder="Use your DEFINE positioning or refine it" />
                  <TextArea label="Known negative narratives circulating" value={tactical.negativeNarratives} onChange={(v) => updateTactical("negativeNarratives", v)} placeholder="e.g. Too young, outsider, legal issues" rows={3} />
                </div>
              </div>

              {/* Communications Arsenal */}
              <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
                <h3 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
                  <Radio size={14} /> Communications Arsenal
                </h3>
                <div className="space-y-5">
                  <RadioCards label="Primary digital platform" options={digitalPlatformOptions} value={tactical.digitalPlatform} onChange={(v) => updateTactical("digitalPlatform", v)} />
                  <RadioCards label="Mainstream media access" options={mediaAccessOptions} value={tactical.mediaAccess} onChange={(v) => updateTactical("mediaAccess", v)} />
                  <CheckboxGrid label="Community channels available" options={communityChannelOptions} values={tactical.communityChannels} onChange={(v) => updateTactical("communityChannels", v)} columns={1} />
                </div>
              </div>

              {/* Days remaining */}
              <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
                <div className="flex items-center gap-3 group">
                  <div className="p-2 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                    <Target size={16} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-[var(--text-muted)] block mb-1">Days remaining to polling day</label>
                    <input
                      type="number"
                      min={0}
                      value={tactical.daysRemaining || ""}
                      onChange={(e) => updateTactical("daysRemaining", parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT — SEED/BUILD/MANAGE */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <TacticalPanel tactical={tactical} phase={tacticalPhase} />
              <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--gold)]" />
                <div className="pl-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain size={16} className="text-[var(--gold)]" />
                    <span className="text-xs font-bold text-[var(--gold)] tracking-wider">AI PERCEPTION ASSESSMENT</span>
                  </div>
                  {aiLoading ? (
                    <div className="flex items-center gap-3 py-4">
                      <div className="w-4 h-4 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-[var(--text-secondary)]">Analysing perception intelligence…</span>
                    </div>
                  ) : aiAssessment ? (
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{aiAssessment}</p>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">Select your voter perception and enter days remaining to activate the AI perception intelligence assessment.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-8 text-center">
            <Lock size={28} className="mx-auto text-[var(--text-muted)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)] mb-2">Tactical Deployment Locked</p>
            <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
              Complete all five phases of the Brand Narrative Builder above to unlock SEED / BUILD / MANAGE tactical operations.
            </p>
          </div>
        )}
      </div>

      {/* Print-only manifesto */}
      <PrintableManifesto manifesto={manifesto} />

      <div className="print:hidden">
        <FrameworkNav currentFramework={5} electionType={electionType} />
      </div>

      <PrecedentModal entryId={modalEntryId} open={!!modalEntryId} onClose={() => setModalEntryId(null)} />

      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .gold-glow { box-shadow: none !important; }
          #manifesto-print, #manifesto-print * {
            color: black !important;
            background: white !important;
            border-color: #ccc !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Manifesto subcomponents ─────────────────────────────────────────────

function ManifestoCard({
  title, value, onChange, onRegenerate, regenerating, multiline,
}: {
  section: string;
  title: string;
  value: string;
  onChange: (v: string) => void;
  onRegenerate: () => void;
  regenerating: boolean;
  multiline?: boolean;
}) {
  return (
    <div className="bg-[var(--bg-elevated)] rounded-lg p-4 border border-[rgba(255,255,255,0.04)]">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-[var(--gold)]">{title}</h4>
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="text-[11px] text-[var(--text-muted)] hover:text-[var(--gold)] flex items-center gap-1"
        >
          {regenerating ? (
            <div className="w-3 h-3 border border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
          ) : (
            <RefreshCw size={11} />
          )}
          Regenerate this section
        </button>
      </div>
      <InlineEditable value={value} onChange={onChange} multiline={multiline} className="text-sm text-white leading-relaxed" />
    </div>
  );
}

function InlineEditable({
  value, onChange, multiline, className,
}: {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return multiline ? (
      <textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        rows={4}
        className={`w-full bg-[var(--bg-surface)] border border-[var(--gold-border)] rounded-md px-2 py-1 focus:outline-none resize-none ${className || ""}`}
      />
    ) : (
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        className={`w-full bg-[var(--bg-surface)] border border-[var(--gold-border)] rounded-md px-2 py-1 focus:outline-none ${className || ""}`}
      />
    );
  }
  return (
    <div
      onClick={() => setEditing(true)}
      className={`cursor-text hover:bg-[rgba(245,166,35,0.05)] rounded-md px-2 py-1 transition-colors ${className || ""}`}
      title="Click to edit"
    >
      {value || <span className="text-[var(--text-muted)] italic">Click to edit…</span>}
    </div>
  );
}

// ─── Stress Gauge ────────────────────────────────────────────────────────

function StressGauge({ score, color, label }: { score: number; color: string; label: string }) {
  const size = 140;
  const r = 60;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth="10" fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease-out, stroke 0.3s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold" style={{ color }}>{score}</div>
        <div className="text-[10px] font-bold tracking-wider mt-1" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Tactical SEED/BUILD/MANAGE Panel (preserved logic) ──────────────────

function TacticalPanel({ tactical, phase }: { tactical: TacticalData; phase: "SEED" | "BUILD" | "MANAGE" }) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <MessageSquare size={14} className="text-[var(--gold)]" />
        Narrative Command Panel
      </h4>
      <div className="flex gap-1 mb-5 bg-[var(--bg-elevated)] rounded-lg p-1">
        {(["SEED", "BUILD", "MANAGE"] as const).map((p) => (
          <div
            key={p}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold tracking-wider text-center ${
              phase === p
                ? "bg-[var(--gold-dim)] text-[var(--gold)] border border-[var(--gold-border)]"
                : "text-[var(--text-muted)]"
            }`}
          >
            {p}
            {phase === p && <span className="ml-1 text-[10px]">ACTIVE</span>}
          </div>
        ))}
      </div>

      {phase === "SEED" && (
        <div className="space-y-4">
          <div className="bg-[var(--bg-elevated)] rounded-lg p-4">
            <p className="text-xs text-[var(--text-muted)] mb-2">Core narrative suggestion</p>
            <p className="text-sm text-white leading-relaxed">
              {tactical.voterPerception.includes("Unknown")
                ? "Your first priority is name recognition. Every piece of content should answer one question: \"Who is this person and why should I care?\" Lead with a local issue that affects daily life."
                : tactical.voterPerception.includes("not fully trusted")
                  ? "Voters know your name but haven't decided if you're real. Every message needs proof — specific commitments, local knowledge, visible presence."
                  : tactical.voterPerception.includes("inexperienced")
                    ? "You're liked but not yet taken seriously. Shift the narrative from personality to competence — show detailed policy understanding and reference specific local data."
                    : tactical.voterPerception.includes("Established")
                      ? "Strong foundation. Seed phase should focus on expanding your base — identify the 20% of voters who haven't engaged."
                      : tactical.voterPerception.includes("Under attack")
                        ? "Defence before expansion. Seed phase must stabilise your brand before growing it."
                        : "Select your voter perception to generate a tailored narrative strategy."}
            </p>
          </div>
          <div className="bg-[var(--bg-elevated)] rounded-lg p-4">
            <p className="text-xs text-[var(--text-muted)] mb-2">Week 1 content plan</p>
            {tactical.digitalPlatform ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-[var(--gold)] font-semibold mt-0.5">1.</span>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {tactical.digitalPlatform.includes("Facebook")
                      ? "Facebook: 3 local issue posts with photos from the constituency."
                      : tactical.digitalPlatform.includes("TikTok")
                        ? "TikTok: 5 short-form videos (under 60s). Show the constituency, talk to real people."
                        : tactical.digitalPlatform.includes("WhatsApp")
                          ? "WhatsApp: Daily voice note to group admins. Personal, under 90 seconds."
                          : "Multi-platform: 2 posts per platform per day. Adapt format for each."}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-[var(--gold)] font-semibold mt-0.5">2.</span>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {tactical.mediaAccess?.includes("Strong")
                      ? "Pitch one exclusive story to your strongest media contact."
                      : tactical.mediaAccess?.includes("Moderate")
                        ? "Create a shareable press release with local data."
                        : "Build media-ready content yourself. Film a 3-minute walkthrough of a local issue."}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-[var(--gold)] font-semibold mt-0.5">3.</span>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {tactical.communityChannels.length > 0
                      ? `Activate your ${tactical.communityChannels.length} community channel${tactical.communityChannels.length > 1 ? "s" : ""} — schedule one face-to-face briefing this week.`
                      : "Identify and approach 2 community gatekeepers this week."}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">Select your primary digital platform to see tailored recommendations.</p>
            )}
          </div>
        </div>
      )}

      {phase === "BUILD" && (
        <div className="space-y-4">
          <div className="bg-[var(--bg-elevated)] rounded-lg p-4">
            <p className="text-xs text-[var(--text-muted)] mb-2">Content cadence recommendation</p>
            <p className="text-sm text-white leading-relaxed">
              {tactical.digitalPlatform.includes("Facebook")
                ? "Build phase cadence: 2 posts daily, alternating between issue content and ground presence. One live session per week."
                : tactical.digitalPlatform.includes("TikTok")
                  ? "Build phase cadence: 3 videos daily — morning briefing, midday issue spotlight, evening ground report."
                  : tactical.digitalPlatform.includes("WhatsApp")
                    ? "Build phase cadence: Morning status update, midday voice note, evening volunteer coordination."
                    : "Build phase cadence: Maintain presence across all platforms with consistent daily rhythm."}
            </p>
          </div>
          <div className="bg-[var(--bg-elevated)] rounded-lg p-4">
            <p className="text-xs text-[var(--text-muted)] mb-2">Community channel priority</p>
            <p className="text-sm text-white leading-relaxed">
              {tactical.communityChannels.length >= 3
                ? `${tactical.communityChannels.length} active channels — strong position. Focus on deepening the top 2.`
                : tactical.communityChannels.length > 0
                  ? `${tactical.communityChannels.length} channel${tactical.communityChannels.length > 1 ? "s" : ""} active. Add at least 1 more this week.`
                  : "Critical gap: No community channels selected. You need at least 2 non-digital touchpoints."}
            </p>
          </div>
        </div>
      )}

      {phase === "MANAGE" && (
        <div className="space-y-4">
          <div className={`bg-[var(--bg-elevated)] rounded-lg p-4 border ${tactical.activeAttack ? "border-[var(--red)]" : "border-[rgba(255,255,255,0.06)]"}`}>
            <p className="text-xs text-[var(--text-muted)] mb-2">Alert status</p>
            {tactical.activeAttack ? (
              <div className="space-y-3">
                <p className="text-sm text-[var(--red)] font-semibold flex items-center gap-2">
                  <AlertTriangle size={14} /> ACTIVE THREAT DETECTED
                </p>
                <p className="text-sm text-white leading-relaxed">
                  Response must: <span className="text-[var(--gold)]">[1]</span> Acknowledge without repeating attack framing → <span className="text-[var(--gold)]">[2]</span> Redirect to strongest ground → <span className="text-[var(--gold)]">[3]</span> Counter with proof.
                </p>
              </div>
            ) : (
              <p className="text-sm text-[var(--green)] flex items-center gap-2">
                <Shield size={14} /> No active threats. Focus on narrative building.
              </p>
            )}
          </div>
          <div className="bg-[var(--bg-elevated)] rounded-lg p-4">
            <p className="text-xs text-[var(--text-muted)] mb-2">Final stretch priorities</p>
            <p className="text-sm text-white leading-relaxed">
              {tactical.daysRemaining <= 7
                ? "Last 7 days: no new narratives. Repeat your strongest message. Ground game is everything now."
                : "Final 14 days: lock in your narrative. No experiments, no new issues. Double down on what's working."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Printable manifesto (print-only) ───────────────────────────────────

function PrintableManifesto({ manifesto }: { manifesto: Manifesto | null }) {
  if (!manifesto) return null;
  return (
    <div className="hidden print:block p-8 text-black bg-white">
      <h1 style={{ fontSize: "24pt", marginBottom: "12pt" }}>Campaign Manifesto</h1>
      <section style={{ marginBottom: "16pt" }}>
        <h2 style={{ fontSize: "14pt", marginBottom: "6pt" }}>Vision Statement</h2>
        <p>{manifesto.vision_statement}</p>
      </section>
      <section style={{ marginBottom: "16pt" }}>
        <h2 style={{ fontSize: "14pt", marginBottom: "6pt" }}>Who I Am</h2>
        <p>{manifesto.who_i_am}</p>
      </section>
      <section style={{ marginBottom: "16pt" }}>
        <h2 style={{ fontSize: "14pt", marginBottom: "6pt" }}>Three Pledges</h2>
        <ol>
          {([1, 2, 3] as const).map((n) => {
            const p = manifesto[`pledge_${n}` as "pledge_1" | "pledge_2" | "pledge_3"];
            return (
              <li key={n} style={{ marginBottom: "8pt" }}>
                <strong>Commitment:</strong> {p.commitment}<br />
                <em>Accountability:</em> {p.accountability}
              </li>
            );
          })}
        </ol>
      </section>
      <section style={{ marginBottom: "16pt" }}>
        <h2 style={{ fontSize: "14pt", marginBottom: "6pt" }}>Constituency Promise</h2>
        <p>{manifesto.constituency_promise}</p>
      </section>
      <section>
        <h2 style={{ fontSize: "14pt", marginBottom: "6pt" }}>Call to Action</h2>
        <p>{manifesto.call_to_action}</p>
      </section>
    </div>
  );
}

export default function PerceptionsPage() {
  return (
    <Suspense>
      <PerceptionsPageContent />
    </Suspense>
  );
}
