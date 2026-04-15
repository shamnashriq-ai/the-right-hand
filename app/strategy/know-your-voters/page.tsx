"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Heart,
  MessageSquare,
  Brain,
  Shield,
  Megaphone,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import FrameworkNav from "@/components/FrameworkNav";
import PrecedentPulse from "@/components/intelligence/PrecedentPulse";
import PrecedentModal from "@/components/intelligence/PrecedentModal";

interface VoterData {
  ethnicComposition: string;
  ageSegment: string;
  socioeconomicProfile: string;
  religiousIdentity: string;
  communityOrganising: string[];
  mediaConsumption: string[];
  dominantEmotion: string;
  primaryMotivator: string;
  trustThreshold: string;
  trustBreaker: string;
  naturalStyle: string;
  strongestCredential: string;
  languages: string[];
  strongestPlatform: string;
}

const defaultData: VoterData = {
  ethnicComposition: "",
  ageSegment: "",
  socioeconomicProfile: "",
  religiousIdentity: "",
  communityOrganising: [],
  mediaConsumption: [],
  dominantEmotion: "",
  primaryMotivator: "",
  trustThreshold: "",
  trustBreaker: "",
  naturalStyle: "",
  strongestCredential: "",
  languages: [],
  strongestPlatform: "",
};

const ethnicOptions = [
  "Predominantly Malay (>60%)",
  "Predominantly Chinese (>60%)",
  "Predominantly Indian (>60%)",
  "Mixed Malay-Chinese (balanced)",
  "Mixed — multi-ethnic, no dominant group",
  "Indigenous / Bumiputera (Sabah / Sarawak)",
];

const ageOptions = [
  "Gen Z dominant (18-28) — first or second election",
  "Millennial dominant (28-42) — career and family pressures",
  "Gen X dominant (42-58) — established, sceptical",
  "Boomer dominant (58+) — traditional values, loyalty patterns",
  "Mixed — no dominant generational bloc",
];

const socioOptions = [
  "Low income — B40 dominant, economic survival concerns",
  "Middle income — M40, cost of living anxiety",
  "Mixed B40/M40 — economic pressure across both",
  "Upper income — T20 significant, governance concerns",
  "Mixed across all income groups",
];

const religiousOptions = [
  "Islam — central, mosque network is primary community hub",
  "Islam — present but moderate, not primary organising force",
  "Buddhism/Taoism — Chinese community associations dominant",
  "Christianity — significant in Sabah/Sarawak communities",
  "Hindu — Tamil community institutions important",
  "Multi-faith — no single religious identity dominant",
];

const communityOptions = [
  "Mosque / surau network (Imam, JKKK)",
  "Chinese associations and clan houses",
  "Tamil community leaders and temple committees",
  "FELDA / FELCRA settlement leaders",
  "Factory floor leaders and union reps",
  "Neighbourhood headmen (Ketua Kampung)",
  "Youth movement leaders (political wings)",
  "School and education network",
  "Agricultural / fishing cooperative leaders",
];

const mediaOptions = [
  "Facebook — primary political news and discussion",
  "WhatsApp groups — community broadcast chains",
  "TikTok — entertainment-led political content",
  "Traditional media — TV3, RTM, print newspapers",
  "YouTube — long-form content, ceramah recordings",
  "Telegram — organised political channels",
  "Physical presence — ceramah, gotong-royong, mosques",
  "Word of mouth — community leader networks only",
];

const emotionOptions = [
  "FRUSTRATED — promised things, not delivered",
  "ANXIOUS — economic pressure, cost of living fear",
  "ANGRY — specific grievance, wants accountability",
  "HOPEFUL — ready for change, waiting for someone credible",
  "FATIGUED — seen too many broken promises, disengaged",
  "PROUD — strong community identity, wants protection",
  "LOYAL — party faithful, need to be mobilised not persuaded",
];

const motivatorOptions = [
  "Economic self-interest — what will actually improve their life",
  "Community identity — who represents 'people like us'",
  "Leadership quality — competence and character of the candidate",
  "Party loyalty — follows the party regardless of candidate",
  "Issue-driven — one specific local issue dominates everything",
  "Anti-vote — voting against the opponent more than for anyone",
  "Social pressure — votes what community leaders recommend",
];

const trustOptions = [
  "Physical presence — they must see you here before the election",
  "Service delivery — evidence of problems solved, not just promised",
  "Community endorsement — trusted leader must vouch for you",
  "Religious credibility — visible piety and Islamic community ties",
  "Youth authenticity — genuine youth identity, not performance",
  "Competence signals — education, professional track record",
  "Sacrifice signal — they must see you risking something for them",
];

const resentOptions = [
  "Arrogance — candidate acts entitled, doesn't listen",
  "Absence — only appears at election time",
  "Outsider — no real roots or connection to the constituency",
  "Association with discredited figures or party factions",
  "Money politics — seen as buying rather than earning support",
  "Overconfidence — takes voters for granted",
  "Inauthenticity — scripted, rehearsed, doesn't speak naturally",
];

const styleOptions = [
  "Storyteller — personal narratives, emotional, anecdotal",
  "Data-driven — evidence, numbers, specific policy details",
  "Conversational — warm, relational, best one-on-one",
  "Energiser — high energy, rallying, best in crowds",
  "Credentialed — professional authority, track record focus",
  "Community voice — speaks the language of the constituency",
];

const credentialOptions = [
  "Born or raised in this constituency",
  "Have served here in a previous role",
  "Professional background directly relevant to local issues",
  "Youth — generational change narrative",
  "Community leader track record outside politics",
  "Party credential — strong alignment with popular party",
];

const languageOptions = [
  "Bahasa Melayu (formal)",
  "Bahasa Melayu (informal / dialek)",
  "Mandarin",
  "Cantonese",
  "Tamil",
  "English",
  "Iban / Kadazan / other indigenous language",
];

const platformOptions = [
  "Ground presence — door-to-door, ceramah, physical visits",
  "Digital — social media content creation and community management",
  "Media — comfortable with press, interviews, formal statements",
  "Community events — gotong royong, kenduri, festivals",
  "Mixed — equally strong across platforms",
];

// Internal mode label overrides
const internalEthnicOptions = [
  "Veteran members (>10 years in party)",
  "Mid-tier members (5-10 years)",
  "Newer members (<5 years)",
  "Mixed seniority — no dominant bloc",
];

const internalAgeOptions = [
  "Old guard dominant — founding generation",
  "Mid-career dominant — division-level operators",
  "Young Turks dominant — reform-minded newer members",
  "Mixed — no dominant generational bloc",
];

const internalSocioOptions = [
  "Division chiefs — political capital holders",
  "Branch-level leaders — ground operators",
  "Ordinary delegates — rank and file",
  "Mixed across all delegate tiers",
];

const internalCommunityOptions = [
  "Division machinery — warlord networks",
  "Wing leadership — Youth / Wanita / Puteri",
  "Factional loyalty — aligned to senior patron",
  "Neutral — independent delegates",
];

function RadioCards({
  label,
  subtext,
  options,
  value,
  onChange,
}: {
  label: string;
  subtext?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-[var(--text-muted)] block mb-1">
        {label}
      </label>
      {subtext && (
        <p className="text-[10px] text-[var(--text-muted)] opacity-60 mb-2">
          {subtext}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium border transition-all text-left
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

function CheckboxGrid({
  label,
  subtext,
  options,
  value,
  onChange,
  max,
}: {
  label: string;
  subtext?: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  max?: number;
}) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else if (!max || value.length < max) {
      onChange([...value, opt]);
    }
  };

  return (
    <div>
      <label className="text-xs text-[var(--text-muted)] block mb-1">
        {label}
      </label>
      {subtext && (
        <p className="text-[10px] text-[var(--text-muted)] opacity-60 mb-2">
          {subtext}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value.includes(opt);
          const disabled = !selected && max !== undefined && value.length >= max;
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              disabled={disabled}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium border transition-all text-left
                ${
                  selected
                    ? "bg-[var(--gold-dim)] text-[var(--gold)] border-[var(--gold-border)]"
                    : disabled
                    ? "bg-transparent text-[var(--text-muted)] border-[rgba(255,255,255,0.05)] opacity-40 cursor-not-allowed"
                    : "bg-transparent text-[var(--text-secondary)] border-[rgba(255,255,255,0.1)] hover:border-[var(--gold-border)]"
                }
              `}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {max && (
        <p className="text-[10px] text-[var(--text-muted)] mt-1">
          {value.length}/{max} selected
        </p>
      )}
    </div>
  );
}

interface AiOutput {
  assessment: string | null;
  precedent: string | null;
  entryId: string | null;
  loading: boolean;
  error: string | null;
}

const defaultAiOutput: AiOutput = {
  assessment: null,
  precedent: null,
  entryId: null,
  loading: false,
  error: null,
};

function AiCard({
  icon: Icon,
  label,
  loadingText,
  output,
  citation,
  onOpenModal,
  copiedId,
  onCopy,
  cardId,
}: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  loadingText: string;
  output: AiOutput;
  citation: string;
  onOpenModal: (id: string) => void;
  copiedId: string | null;
  onCopy: (id: string, text: string) => void;
  cardId: string;
}) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--gold)]" />
      <div className="pl-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-[var(--gold)]" />
            <span className="text-xs font-bold text-[var(--gold)] tracking-wider">
              AI INTELLIGENCE · {label}
            </span>
          </div>
          {output.assessment && (
            <button
              onClick={() => onCopy(cardId, output.assessment!)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--bg-elevated)] transition-all"
            >
              {copiedId === cardId ? <Check size={12} /> : <Copy size={12} />}
              {copiedId === cardId ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        {output.loading ? (
          <div className="flex items-center gap-3 py-4">
            <div className="w-4 h-4 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--text-secondary)]">
              {loadingText}
            </span>
          </div>
        ) : output.error ? (
          <p className="text-sm text-[var(--red)]">{output.error}</p>
        ) : output.assessment ? (
          <>
            <p className="text-[15px] text-white leading-[1.7]">
              {output.assessment}
            </p>
            <p className="text-xs italic text-[var(--gold)] opacity-70 mt-4">
              Grounded in: {citation}
            </p>
            <PrecedentPulse
              precedent={output.precedent}
              entryId={output.entryId}
              onOpenModal={onOpenModal}
            />
          </>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            Complete at least 5 input blocks above to activate this intelligence output.
          </p>
        )}
      </div>
    </div>
  );
}

function KnowYourVotersContent() {
  const searchParams = useSearchParams();
  const electionType = searchParams.get("election_type") || "constituency";
  const isInternal = electionType === "internal";

  const [data, setData] = useState<VoterData>(defaultData);
  const [archetype, setArchetype] = useState<AiOutput>(defaultAiOutput);
  const [calibration, setCalibration] = useState<AiOutput>(defaultAiOutput);
  const [manifesto, setManifesto] = useState<AiOutput>(defaultAiOutput);
  const [modalEntryId, setModalEntryId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback(
    (field: keyof VoterData, value: string | string[]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const filledCount = [
    data.ethnicComposition,
    data.ageSegment,
    data.socioeconomicProfile,
    data.religiousIdentity,
    data.communityOrganising.length > 0 ? "yes" : "",
    data.mediaConsumption.length > 0 ? "yes" : "",
    data.dominantEmotion,
    data.primaryMotivator,
    data.trustThreshold,
  ].filter(Boolean).length;

  const hasEnoughData = filledCount >= 5;

  useEffect(() => {
    if (!hasEnoughData) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const payload = { ...data, election_type: electionType };

      setArchetype((prev) => ({ ...prev, loading: true, error: null }));
      fetch("/api/strategy/voter/archetype", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((result) => {
          setArchetype({
            assessment: result.assessment || null,
            precedent: result.precedent || null,
            entryId: result.precedent_entry_id || null,
            loading: false,
            error: result.error || null,
          });
        })
        .catch(() => {
          setArchetype({
            ...defaultAiOutput,
            error: "Connection error. Check your network.",
          });
        });

      setCalibration((prev) => ({ ...prev, loading: true, error: null }));
      fetch("/api/strategy/voter/calibration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((result) => {
          setCalibration({
            assessment: result.assessment || null,
            precedent: result.precedent || null,
            entryId: result.precedent_entry_id || null,
            loading: false,
            error: result.error || null,
          });
        })
        .catch(() => {
          setCalibration({
            ...defaultAiOutput,
            error: "Connection error. Check your network.",
          });
        });

      setManifesto((prev) => ({ ...prev, loading: true, error: null }));
      fetch("/api/strategy/voter/manifesto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((result) => {
          setManifesto({
            assessment: result.assessment || null,
            precedent: result.precedent || null,
            entryId: result.precedent_entry_id || null,
            loading: false,
            error: result.error || null,
          });
        })
        .catch(() => {
          setManifesto({
            ...defaultAiOutput,
            error: "Connection error. Check your network.",
          });
        });
    }, 1500);
  }, [data, hasEnoughData, electionType]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-[var(--gold-dim)]">
            <Users size={20} className="text-[var(--gold)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {isInternal
                ? "Know Your Delegates"
                : "Framework 2 — Know Your Voter"}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Before numbers, before machinery, before narrative — understand
              who these people are and what moves them.
            </p>
          </div>
        </div>
        {isInternal && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(212,175,55,0.1)] border border-[var(--gold-border)]">
            <span className="text-[10px] font-bold text-[var(--gold)] tracking-wider">
              PARTY INTERNAL MODE
            </span>
          </div>
        )}
      </motion.div>

      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8 flex items-center gap-2 text-xs overflow-x-auto pb-2"
      >
        {[
          "Know Your Ground",
          "Know Your Voter",
          "Game of Numbers",
          "Mobilisation",
          "Perceptions",
        ].map((step, i) => (
          <div key={step} className="flex items-center gap-2 shrink-0">
            <span
              className={`px-3 py-1 rounded-full border ${
                i === 1
                  ? "bg-[var(--gold-dim)] text-[var(--gold)] border-[var(--gold-border)]"
                  : i === 0
                  ? "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[rgba(255,255,255,0.06)]"
                  : "text-[var(--text-muted)] border-[rgba(255,255,255,0.06)]"
              }`}
            >
              {step}
            </span>
            {i < 4 && (
              <span className="text-[var(--text-muted)] opacity-30">→</span>
            )}
          </div>
        ))}
      </motion.div>

      <div className="space-y-8">
        {/* SECTION 1 — Constituency Demographics */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h3 className="text-sm font-semibold text-[var(--gold)] mb-1 flex items-center gap-2">
              <Shield size={14} />
              {isInternal ? "DELEGATE BASE PROFILE" : "CONSTITUENCY PROFILE"}
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] mb-5">
              Not for profiling — for calibrating. Every input here shapes the
              communication strategy the platform produces.
            </p>
            <div className="space-y-6">
              <RadioCards
                label={
                  isInternal
                    ? "Delegate seniority profile"
                    : "Dominant ethnic composition of the constituency"
                }
                options={isInternal ? internalEthnicOptions : ethnicOptions}
                value={data.ethnicComposition}
                onChange={(v) => update("ethnicComposition", v)}
              />
              <RadioCards
                label={
                  isInternal
                    ? "Delegate generation"
                    : "Dominant age segment"
                }
                options={isInternal ? internalAgeOptions : ageOptions}
                value={data.ageSegment}
                onChange={(v) => update("ageSegment", v)}
              />
              <RadioCards
                label={
                  isInternal
                    ? "Delegate political capital"
                    : "Constituency socioeconomic profile"
                }
                options={isInternal ? internalSocioOptions : socioOptions}
                value={data.socioeconomicProfile}
                onChange={(v) => update("socioeconomicProfile", v)}
              />
              <RadioCards
                label="Dominant religious identity and its role in daily life"
                options={religiousOptions}
                value={data.religiousIdentity}
                onChange={(v) => update("religiousIdentity", v)}
              />
              <CheckboxGrid
                label={
                  isInternal
                    ? "Delegate influence network"
                    : "Community organising structure — who actually moves people"
                }
                options={
                  isInternal ? internalCommunityOptions : communityOptions
                }
                value={data.communityOrganising}
                onChange={(v) => update("communityOrganising", v)}
                max={3}
              />
              <CheckboxGrid
                label="How do voters in this constituency consume information?"
                subtext="Select the top 2 channels that dominate ground communication."
                options={mediaOptions}
                value={data.mediaConsumption}
                onChange={(v) => update("mediaConsumption", v)}
                max={2}
              />
            </div>
          </div>
        </motion.div>

        {/* SECTION 2 — Voter Psychology */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h3 className="text-sm font-semibold text-[var(--gold)] mb-1 flex items-center gap-2">
              <Heart size={14} />
              {isInternal ? "DELEGATE PSYCHOLOGY" : "VOTER PSYCHOLOGY"}
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] mb-5">
              Demographics tell you who. Psychology tells you why they vote — and
              what it will take for them to vote for you.
            </p>
            <div className="space-y-6">
              <RadioCards
                label="What is the dominant emotional state of this voter base right now?"
                subtext="Not what they say in surveys — what you observe when you talk to them on the ground."
                options={emotionOptions}
                value={data.dominantEmotion}
                onChange={(v) => update("dominantEmotion", v)}
              />
              <RadioCards
                label="What primarily motivates this voter base to vote?"
                options={motivatorOptions}
                value={data.primaryMotivator}
                onChange={(v) => update("primaryMotivator", v)}
              />
              <RadioCards
                label="What does this voter base need to see before they trust a candidate?"
                subtext="Not what they say they want — the actual trust signal you've observed."
                options={trustOptions}
                value={data.trustThreshold}
                onChange={(v) => update("trustThreshold", v)}
              />
              <RadioCards
                label="What is this voter base most likely to hold against a candidate?"
                subtext="The trust-breaker. The thing that immediately disqualifies."
                options={resentOptions}
                value={data.trustBreaker}
                onChange={(v) => update("trustBreaker", v)}
              />
            </div>
          </div>
        </motion.div>

        {/* SECTION 3 — Candidate Communication Profile */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h3 className="text-sm font-semibold text-[var(--gold)] mb-1 flex items-center gap-2">
              <MessageSquare size={14} />
              CANDIDATE COMMUNICATION PROFILE
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] mb-5">
              The platform calibrates how you speak to this voter base — but only
              if it understands how you naturally communicate.
            </p>
            <div className="space-y-6">
              <RadioCards
                label="How do you naturally communicate when you're at your best?"
                options={styleOptions}
                value={data.naturalStyle}
                onChange={(v) => update("naturalStyle", v)}
              />
              <RadioCards
                label="Your strongest authentic credential for this seat"
                options={credentialOptions}
                value={data.strongestCredential}
                onChange={(v) => update("strongestCredential", v)}
              />
              <CheckboxGrid
                label="Languages you speak fluently and can campaign in"
                options={languageOptions}
                value={data.languages}
                onChange={(v) => update("languages", v)}
              />
              <RadioCards
                label="Your strongest campaign platform"
                options={platformOptions}
                value={data.strongestPlatform}
                onChange={(v) => update("strongestPlatform", v)}
              />
            </div>
          </div>
        </motion.div>

        {/* DATA SUFFICIENCY INDICATOR */}
        <AnimatePresence>
          {!hasEnoughData && filledCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)]"
            >
              <div className="w-2 h-2 rounded-full bg-[var(--amber)] animate-pulse" />
              <span className="text-xs text-[var(--text-muted)]">
                {filledCount}/5 inputs completed — fill at least 5 to activate
                AI intelligence outputs
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI OUTPUT CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-6"
        >
          <AiCard
            icon={Brain}
            label={
              isInternal
                ? "DELEGATE PSYCHOLOGY PROFILE"
                : "VOTER ARCHETYPE PROFILE"
            }
            loadingText="Profiling your voter base..."
            output={archetype}
            citation="Murray Edelman · The Symbolic Uses of Politics · 1964"
            onOpenModal={setModalEntryId}
            copiedId={copiedId}
            onCopy={handleCopy}
            cardId="archetype"
          />

          <AiCard
            icon={Megaphone}
            label={
              isInternal
                ? "DELEGATE CULTIVATION CALIBRATION"
                : "COMMUNICATION CALIBRATION"
            }
            loadingText="Calibrating communication strategy..."
            output={calibration}
            citation="Jennifer Lees-Marshment · Political Marketing · 2009"
            onOpenModal={setModalEntryId}
            copiedId={copiedId}
            onCopy={handleCopy}
            cardId="calibration"
          />

          <AiCard
            icon={FileText}
            label={
              isInternal
                ? "INTERNAL REFORM INTELLIGENCE"
                : "MANIFESTO INTELLIGENCE"
            }
            loadingText="Building manifesto intelligence..."
            output={manifesto}
            citation="Saul Alinsky · Rules for Radicals · 1971"
            onOpenModal={setModalEntryId}
            copiedId={copiedId}
            onCopy={handleCopy}
            cardId="manifesto"
          />
        </motion.div>
      </div>

      <FrameworkNav currentFramework={2} electionType={electionType} />
      <PrecedentModal
        entryId={modalEntryId}
        open={!!modalEntryId}
        onClose={() => setModalEntryId(null)}
      />
    </div>
  );
}

export default function KnowYourVoters() {
  return (
    <Suspense>
      <KnowYourVotersContent />
    </Suspense>
  );
}
