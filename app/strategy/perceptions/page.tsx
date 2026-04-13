"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Flame, Eye, MessageSquare, Radio, Newspaper, Users,
  Shield, AlertTriangle, Brain, Copy, Check, Zap,
  Target, Megaphone, BarChart3
} from "lucide-react";
import FrameworkNav from "@/components/FrameworkNav";

// ─── Types ───
interface PerceptionData {
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

const defaultData: PerceptionData = {
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

// ─── Components ───

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
      <label className="text-xs text-[var(--text-muted)] block mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium border transition-all text-left
              ${value === opt
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

function CheckboxGroup({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (values.includes(id)) {
      onChange(values.filter((v) => v !== id));
    } else {
      onChange([...values, id]);
    }
  };

  return (
    <div>
      <label className="text-xs text-[var(--text-muted)] block mb-2">{label}</label>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => toggle(opt.id)}
            className={`
              flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left
              ${values.includes(opt.id)
                ? "bg-[var(--gold-dim)] text-[var(--gold)] border-[var(--gold-border)]"
                : "bg-transparent text-[var(--text-secondary)] border-[rgba(255,255,255,0.1)] hover:border-[var(--gold-border)]"
              }
            `}
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
              values.includes(opt.id) ? "border-[var(--gold)] bg-[var(--gold-dim)]" : "border-[rgba(255,255,255,0.2)]"
            }`}>
              {values.includes(opt.id) && <Check size={10} />}
            </div>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Narrative Phase Logic ───
function getPhase(daysRemaining: number): "SEED" | "BUILD" | "MANAGE" {
  if (daysRemaining > 30 || daysRemaining === 0) return "SEED";
  if (daysRemaining >= 14) return "BUILD";
  return "MANAGE";
}

// ─── Main Page ───
function PerceptionsPageContent() {
  const searchParams = useSearchParams();
  const electionType = searchParams.get("election_type") || undefined;
  const [data, setData] = useState<PerceptionData>(defaultData);
  const [aiAssessment, setAiAssessment] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [responseOptions, setResponseOptions] = useState<{ firm: string; pivot: string; elevate: string } | null>(null);
  const [responseLoading, setResponseLoading] = useState(false);
  const [copiedOption, setCopiedOption] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const responseDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback(<K extends keyof PerceptionData>(field: K, value: PerceptionData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const phase = getPhase(data.daysRemaining);

  // Read days remaining from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const days = params.get("daysRemaining");
    if (days) update("daysRemaining", parseInt(days) || 0);
  }, [update]);

  // AI Perception Assessment
  useEffect(() => {
    if (data.voterPerception && data.daysRemaining > 0) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setAiLoading(true);
        try {
          const res = await fetch("/api/strategy/perceptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...data,
              phase,
              channelCount: data.communityChannels.length,
            }),
          });
          const result = await res.json();
          setAiAssessment(result.assessment || "Unable to generate assessment.");
        } catch {
          setAiAssessment("Connection error. Check your network and try again.");
        } finally {
          setAiLoading(false);
        }
      }, 1200);
    }
  }, [data, phase]);

  // In-Situational Response Engine
  useEffect(() => {
    if (data.activeAttack && data.attackDescription.length > 10 && data.attackSeverity) {
      if (responseDebounceRef.current) clearTimeout(responseDebounceRef.current);
      responseDebounceRef.current = setTimeout(async () => {
        setResponseLoading(true);
        try {
          const res = await fetch("/api/strategy/response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              attackDescription: data.attackDescription,
              severity: data.attackSeverity,
              voterPerception: data.voterPerception,
              positioning: data.positioning,
              daysRemaining: data.daysRemaining,
            }),
          });
          const result = await res.json();
          setResponseOptions(result.responses || null);
        } catch {
          setResponseOptions(null);
        } finally {
          setResponseLoading(false);
        }
      }, 1200);
    } else {
      setResponseOptions(null);
    }
  }, [data.activeAttack, data.attackDescription, data.attackSeverity, data.voterPerception, data.positioning, data.daysRemaining]);

  const copyToClipboard = (text: string, option: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOption(option);
    setTimeout(() => setCopiedOption(null), 2000);
  };

  // Severity border color
  const getSeverityBorder = () => {
    if (data.attackSeverity.includes("Severe")) return "border-[var(--red)]";
    if (data.attackSeverity.includes("Moderate")) return "border-[var(--amber)]";
    return "border-[var(--gold-border)]";
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
            <Flame size={20} className="text-[var(--gold)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Managing Perceptions</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Framework 5 — Narrative command centre, comms architecture, and response engine
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8">
        {/* ─── LEFT COLUMN — Inputs (40%) ─── */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Section A — Candidate Brand */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h3 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
              <Eye size={14} />
              Candidate Brand
            </h3>
            <div className="space-y-5">
              <RadioCards
                label="Current voter perception"
                options={perceptionOptions}
                value={data.voterPerception}
                onChange={(v) => update("voterPerception", v)}
              />

              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">One-sentence positioning</label>
                <input
                  type="text"
                  value={data.positioning}
                  onChange={(e) => update("positioning", e.target.value)}
                  placeholder="The candidate who actually solves problems for working families"
                  className="w-full bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Known negative narratives circulating</label>
                <textarea
                  value={data.negativeNarratives}
                  onChange={(e) => update("negativeNarratives", e.target.value)}
                  placeholder="e.g. Too young, outsider to this area, legal issues"
                  rows={3}
                  className="w-full bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section B — Communications Arsenal */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h3 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
              <Radio size={14} />
              Communications Arsenal
            </h3>
            <div className="space-y-5">
              <RadioCards
                label="Primary digital platform"
                options={digitalPlatformOptions}
                value={data.digitalPlatform}
                onChange={(v) => update("digitalPlatform", v)}
              />
              <RadioCards
                label="Mainstream media access"
                options={mediaAccessOptions}
                value={data.mediaAccess}
                onChange={(v) => update("mediaAccess", v)}
              />
              <CheckboxGroup
                label="Community channels available"
                options={communityChannelOptions}
                values={data.communityChannels}
                onChange={(v) => update("communityChannels", v)}
              />
            </div>
          </div>

          {/* Section C — Live Threat Monitor */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h3 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
              <Shield size={14} />
              Live Threat Monitor
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-2">Active opponent attacks?</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => update("activeAttack", true)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      data.activeAttack
                        ? "bg-[rgba(239,68,68,0.15)] text-[var(--red)] border-[rgba(239,68,68,0.3)]"
                        : "bg-transparent text-[var(--text-secondary)] border-[rgba(255,255,255,0.1)] hover:border-[var(--gold-border)]"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => {
                      update("activeAttack", false);
                      update("attackDescription", "");
                      update("attackSeverity", "");
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      !data.activeAttack && data.voterPerception
                        ? "bg-[rgba(34,197,94,0.15)] text-[var(--green)] border-[rgba(34,197,94,0.3)]"
                        : !data.activeAttack
                          ? "bg-transparent text-[var(--text-secondary)] border-[rgba(255,255,255,0.1)] hover:border-[var(--gold-border)]"
                          : "bg-transparent text-[var(--text-secondary)] border-[rgba(255,255,255,0.1)] hover:border-[var(--gold-border)]"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {data.activeAttack && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs text-[var(--text-muted)] block mb-1">Describe the attack</label>
                    <textarea
                      value={data.attackDescription}
                      onChange={(e) => update("attackDescription", e.target.value.slice(0, 200))}
                      placeholder="What is the opponent saying or doing?"
                      rows={3}
                      maxLength={200}
                      className="w-full bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors resize-none"
                    />
                    <p className="text-[10px] text-[var(--text-muted)] mt-1 text-right">{data.attackDescription.length}/200</p>
                  </div>
                  <RadioCards
                    label="Severity"
                    options={severityOptions}
                    value={data.attackSeverity}
                    onChange={(v) => update("attackSeverity", v)}
                  />
                </motion.div>
              )}
            </div>
          </div>

          {/* Days remaining input */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <div className="flex items-center gap-3 group">
              <div className="p-2 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] group-focus-within:text-[var(--gold)] transition-colors">
                <Target size={16} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-[var(--text-muted)] block mb-1">Days remaining to polling day</label>
                <input
                  type="number"
                  min={0}
                  value={data.daysRemaining || ""}
                  onChange={(e) => update("daysRemaining", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── RIGHT COLUMN — Live Intelligence (60%) ─── */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-6"
        >
          {/* CARD 1 — Narrative Command Panel */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <MessageSquare size={14} className="text-[var(--gold)]" />
              Narrative Command Panel
            </h4>

            {/* Phase tabs */}
            <div className="flex gap-1 mb-5 bg-[var(--bg-elevated)] rounded-lg p-1">
              {(["SEED", "BUILD", "MANAGE"] as const).map((p) => (
                <button
                  key={p}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold tracking-wider transition-all ${
                    phase === p
                      ? "bg-[var(--gold-dim)] text-[var(--gold)] border border-[var(--gold-border)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {p}
                  {phase === p && <span className="ml-1 text-[10px]">ACTIVE</span>}
                </button>
              ))}
            </div>

            {/* Phase content */}
            {phase === "SEED" && (
              <div className="space-y-4">
                <div className="bg-[var(--bg-elevated)] rounded-lg p-4">
                  <p className="text-xs text-[var(--text-muted)] mb-2">Core narrative suggestion</p>
                  <p className="text-sm text-white leading-relaxed">
                    {data.voterPerception.includes("Unknown")
                      ? "Your first priority is name recognition. Every piece of content should answer one question: \"Who is this person and why should I care?\" Lead with a local issue that affects daily life."
                      : data.voterPerception.includes("not fully trusted")
                        ? "Voters know your name but haven't decided if you're real. Every message needs proof — specific commitments, local knowledge, visible presence. Trust is built through consistency, not promises."
                        : data.voterPerception.includes("inexperienced")
                          ? "You're liked but not yet taken seriously. Shift the narrative from personality to competence — show detailed policy understanding, reference specific local data, and feature endorsements from respected figures."
                          : data.voterPerception.includes("Established")
                            ? "Strong foundation. Seed phase should focus on expanding your base — identify the 20% of voters who haven't engaged and find the one issue that connects you to them."
                            : data.voterPerception.includes("Under attack")
                              ? "Defence before expansion. Seed phase must stabilise your brand before growing it. Address the attack narrative indirectly by flooding channels with positive proof points."
                              : "Select your voter perception to generate a tailored narrative strategy."}
                  </p>
                </div>

                <div className="bg-[var(--bg-elevated)] rounded-lg p-4">
                  <p className="text-xs text-[var(--text-muted)] mb-2">Week 1 content plan</p>
                  <div className="space-y-2">
                    {data.digitalPlatform ? (
                      <>
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-[var(--gold)] font-semibold mt-0.5">1.</span>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {data.digitalPlatform.includes("Facebook")
                              ? "Facebook: 3 local issue posts with photos from the constituency. One must feature a real resident's story."
                              : data.digitalPlatform.includes("TikTok")
                                ? "TikTok: 5 short-form videos (under 60s). Show the constituency, talk to real people, react to local news."
                                : data.digitalPlatform.includes("WhatsApp")
                                  ? "WhatsApp: Daily voice note to group admins. Personal, under 90 seconds, addressing one local issue each day."
                                  : "Multi-platform: 2 posts per platform per day. Adapt format — video for TikTok, stories for Facebook, voice for WhatsApp."}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-[var(--gold)] font-semibold mt-0.5">2.</span>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {data.mediaAccess?.includes("Strong")
                              ? "Pitch one exclusive story to your strongest media contact — a data-driven angle the competition hasn't covered."
                              : data.mediaAccess?.includes("Moderate")
                                ? "Create a shareable press release with local data. Make it easy for journalists to cover you."
                                : "Build media-ready content yourself. Film a 3-minute walkthrough of a local issue — become your own journalist."}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-[var(--gold)] font-semibold mt-0.5">3.</span>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {data.communityChannels.length > 0
                              ? `Activate your ${data.communityChannels.length} community channel${data.communityChannels.length > 1 ? "s" : ""} — schedule one face-to-face briefing with key leaders this week.`
                              : "Identify and approach 2 community gatekeepers this week. Listen before pitching."}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-[var(--text-muted)]">Select your primary digital platform to see tailored recommendations.</p>
                    )}
                  </div>
                </div>

                <div className="bg-[var(--bg-elevated)] rounded-lg p-4">
                  <p className="text-xs text-[var(--text-muted)] mb-2">Issue to own first</p>
                  <p className="text-sm text-white">
                    {data.voterPerception
                      ? "Pick the single local issue that your opponent has ignored. Own it completely — become the only candidate who has a specific, visible plan for it. This becomes your signature."
                      : "Select voter perception to generate issue recommendation."}
                  </p>
                </div>
              </div>
            )}

            {phase === "BUILD" && (
              <div className="space-y-4">
                <div className="bg-[var(--bg-elevated)] rounded-lg p-4">
                  <p className="text-xs text-[var(--text-muted)] mb-2">Content cadence recommendation</p>
                  <p className="text-sm text-white leading-relaxed">
                    {data.digitalPlatform.includes("Facebook")
                      ? "Build phase cadence: 2 posts daily, alternating between issue content and ground presence. One live session per week. Share supporter testimonials every 3 days."
                      : data.digitalPlatform.includes("TikTok")
                        ? "Build phase cadence: 3 videos daily — morning briefing (30s), midday issue spotlight (45s), evening ground report (60s). Engage comments within 1 hour."
                        : data.digitalPlatform.includes("WhatsApp")
                          ? "Build phase cadence: Morning status update to all groups. Midday voice note with one talking point. Evening volunteer coordination. Never go silent for more than 6 hours."
                          : "Build phase cadence: Maintain presence across all platforms. Morning content drop, afternoon engagement, evening ground report. Consistency beats volume."}
                  </p>
                </div>

                <div className="bg-[var(--bg-elevated)] rounded-lg p-4">
                  <p className="text-xs text-[var(--text-muted)] mb-2">Earned media angle</p>
                  <p className="text-sm text-white leading-relaxed">
                    {data.mediaAccess?.includes("Strong")
                      ? "Pitch hook: Commission a hyper-local survey or data analysis that only your campaign has. Journalists need exclusives — give them numbers nobody else can verify."
                      : "Pitch hook: Create a visible, photographable action — a site visit, a town hall, a specific policy announcement. Media covers events, not promises. Give them a scene to shoot."}
                  </p>
                </div>

                <div className="bg-[var(--bg-elevated)] rounded-lg p-4">
                  <p className="text-xs text-[var(--text-muted)] mb-2">Community channel priority</p>
                  <p className="text-sm text-white leading-relaxed">
                    {data.communityChannels.length >= 3
                      ? `You have ${data.communityChannels.length} active channels — strong position. Focus on deepening the top 2 rather than adding new ones. Schedule recurring touchpoints.`
                      : data.communityChannels.length > 0
                        ? `${data.communityChannels.length} channel${data.communityChannels.length > 1 ? "s" : ""} active. Add at least 1 more this week — diversified channels reduce single-point-of-failure risk.`
                        : "Critical gap: No community channels selected. You need at least 2 non-digital touchpoints. Start with surau networks and community leaders."}
                  </p>
                </div>
              </div>
            )}

            {phase === "MANAGE" && (
              <div className="space-y-4">
                <div className={`bg-[var(--bg-elevated)] rounded-lg p-4 border ${
                  data.activeAttack ? "border-[var(--red)]" : "border-[rgba(255,255,255,0.06)]"
                }`}>
                  <p className="text-xs text-[var(--text-muted)] mb-2">Alert status</p>
                  {data.activeAttack ? (
                    <div className="space-y-3">
                      <p className="text-sm text-[var(--red)] font-semibold flex items-center gap-2">
                        <AlertTriangle size={14} />
                        ACTIVE THREAT DETECTED
                      </p>
                      <div className="bg-[var(--bg-base)] rounded-lg p-3">
                        <p className="text-xs text-[var(--text-muted)] mb-1">Rapid Response Framework</p>
                        <p className="text-sm text-white leading-relaxed">
                          Your response must: <span className="text-[var(--gold)]">[1]</span> Acknowledge the issue exists without repeating the attack framing → <span className="text-[var(--gold)]">[2]</span> Redirect to your strongest ground with specific evidence → <span className="text-[var(--gold)]">[3]</span> Counter with proof that makes the attack look uninformed.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--green)] flex items-center gap-2">
                      <Shield size={14} />
                      No active threats. Focus on narrative building.
                    </p>
                  )}
                </div>

                <div className="bg-[var(--bg-elevated)] rounded-lg p-4">
                  <p className="text-xs text-[var(--text-muted)] mb-2">Final stretch priorities</p>
                  <p className="text-sm text-white leading-relaxed">
                    {data.daysRemaining <= 7
                      ? "Last 7 days: no new narratives. Repeat your strongest message everywhere. Ground game is everything now. Every content piece should drive turnout, not persuasion."
                      : "Final 14 days: lock in your narrative. No experiments, no new issues. Double down on what's working, cut what isn't. Content frequency should peak now."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* CARD 2 — In-Situational Response Engine */}
          {data.activeAttack && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`bg-[var(--bg-surface)] rounded-xl border-2 p-5 transition-colors ${getSeverityBorder()}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={16} className={data.attackSeverity.includes("Severe") ? "text-[var(--red)]" : "text-[var(--amber)]"} />
                <span className="text-xs font-bold tracking-wider" style={{
                  color: data.attackSeverity.includes("Severe") ? "var(--red)" : "var(--amber)"
                }}>
                  RESPONSE BRIEF — AI GENERATED
                </span>
              </div>

              {responseLoading ? (
                <div className="flex items-center gap-3 py-6">
                  <div className="w-4 h-4 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-[var(--text-secondary)]">Generating response options...</span>
                </div>
              ) : responseOptions ? (
                <div className="space-y-3">
                  {([
                    { key: "firm", label: "FIRM", icon: Target, desc: "Direct factual rebuttal" },
                    { key: "pivot", label: "PIVOT", icon: Megaphone, desc: "Redirect and elevate" },
                    { key: "elevate", label: "ELEVATE", icon: Zap, desc: "Rise above entirely" },
                  ] as const).map(({ key, label, icon: Icon, desc }) => (
                    <div key={key} className="bg-[var(--bg-elevated)] rounded-lg p-4 flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-[var(--bg-base)]">
                        <Icon size={14} className="text-[var(--gold)]" />
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
                        title="Copy response"
                      >
                        {copiedOption === key ? <Check size={14} className="text-[var(--green)]" /> : <Copy size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)] py-4">
                  {data.attackDescription.length <= 10
                    ? "Describe the attack in detail (minimum 10 characters) and select severity to generate response options."
                    : !data.attackSeverity
                      ? "Select attack severity to generate response options."
                      : "Generating..."}
                </p>
              )}
            </motion.div>
          )}

          {/* CARD 3 — AI Perception Assessment */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--gold)]" />

            <div className="pl-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain size={16} className="text-[var(--gold)]" />
                <span className="text-xs font-bold text-[var(--gold)] tracking-wider">AI INTELLIGENCE</span>
              </div>

              {aiLoading ? (
                <div className="flex items-center gap-3 py-4">
                  <div className="w-4 h-4 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-[var(--text-secondary)]">Analysing perception intelligence...</span>
                </div>
              ) : aiAssessment ? (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{aiAssessment}</p>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  Select your voter perception and enter days remaining to activate the AI perception intelligence assessment.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <FrameworkNav currentFramework={5} electionType={electionType} />
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
