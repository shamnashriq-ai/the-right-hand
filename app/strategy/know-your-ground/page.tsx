"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Target, MapPin, Users, BarChart3, Brain, Shield } from "lucide-react";
import FrameworkNav from "@/components/FrameworkNav";

interface GroundData {
  seatName: string;
  seatType: string;
  classification: string;
  totalVoters: number;
  candidateStatus: string;
  previousResult: string;
  opponentStrength: string;
  candidatesContesting: string;
  topLocalIssue: string;
  partyBrand: string;
  daysUntilPolling: number;
}

const defaultData: GroundData = {
  seatName: "",
  seatType: "",
  classification: "",
  totalVoters: 0,
  candidateStatus: "",
  previousResult: "",
  opponentStrength: "",
  candidatesContesting: "",
  topLocalIssue: "",
  partyBrand: "",
  daysUntilPolling: 0,
};

const seatTypes = ["Parliamentary", "State Assembly", "Party Internal", "Local Government"];
const classifications = ["Urban", "Semi-Urban", "Rural"];
const statuses = ["Challenger", "Incumbent Defending", "Open Seat"];
const previousResults = ["Won previously", "Lost previously", "First contest"];
const opponentStrengths = ["Weak", "Moderate", "Strong — dominant incumbent"];
const contestingOptions = ["2", "3", "4", "5+"];
const brandOptions = ["Strong tailwind", "Neutral", "Headwind against us"];

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
              px-3 py-1.5 rounded-full text-xs font-medium border transition-all
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

export default function KnowYourGround() {
  const [data, setData] = useState<GroundData>(defaultData);
  const [aiAssessment, setAiAssessment] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback((field: keyof GroundData, value: string | number) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Derived intelligence
  const hasEnoughData = data.seatType && data.classification && data.candidateStatus && data.opponentStrength && data.daysUntilPolling > 0;

  const situationLabel = (() => {
    if (!data.partyBrand || !data.opponentStrength) return null;
    if (data.partyBrand === "Strong tailwind" && data.opponentStrength === "Weak") return "FAVOURABLE";
    if (data.partyBrand === "Headwind against us" && data.opponentStrength === "Strong — dominant incumbent") return "HOSTILE";
    if (data.partyBrand === "Headwind against us" || data.opponentStrength === "Strong — dominant incumbent") return "UPHILL";
    return "CONTESTED";
  })();

  const situationColor = (() => {
    switch (situationLabel) {
      case "FAVOURABLE": return "var(--green)";
      case "HOSTILE": return "var(--red)";
      case "UPHILL": return "var(--amber)";
      case "CONTESTED": return "var(--gold)";
      default: return "var(--text-muted)";
    }
  })();

  // AI assessment
  useEffect(() => {
    if (hasEnoughData) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setAiLoading(true);
        try {
          const res = await fetch("/api/strategy/ground", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
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
  }, [data, hasEnoughData]);

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
            <Target size={20} className="text-[var(--gold)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Know Your Ground</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Framework 1 — Map the battlefield before you fight
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
          {/* Section A — Seat Intelligence */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h3 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
              <MapPin size={14} />
              Seat Intelligence
            </h3>
            <div className="space-y-5">
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Seat / Position</label>
                <input
                  type="text"
                  value={data.seatName}
                  onChange={(e) => update("seatName", e.target.value)}
                  placeholder="Constituency or party position"
                  className="w-full bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
                />
              </div>
              <RadioCards label="Seat Type" options={seatTypes} value={data.seatType} onChange={(v) => update("seatType", v)} />
              <RadioCards label="Classification" options={classifications} value={data.classification} onChange={(v) => update("classification", v)} />
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Total Registered Voters</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={data.totalVoters || ""}
                    onChange={(e) => update("totalVoters", parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="flex-1 bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
                  />
                  <span className="text-xs text-[var(--text-muted)]">voters</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section B — Candidate Status */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h3 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
              <Users size={14} />
              Candidate Status
            </h3>
            <div className="space-y-5">
              <RadioCards label="Your Status" options={statuses} value={data.candidateStatus} onChange={(v) => update("candidateStatus", v)} />
              <RadioCards label="Previous Result in This Seat" options={previousResults} value={data.previousResult} onChange={(v) => update("previousResult", v)} />
              <RadioCards label="Main Opponent Strength" options={opponentStrengths} value={data.opponentStrength} onChange={(v) => update("opponentStrength", v)} />
              <RadioCards label="Candidates Contesting" options={contestingOptions} value={data.candidatesContesting} onChange={(v) => update("candidatesContesting", v)} />
            </div>
          </div>

          {/* Section C — Context */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h3 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
              <BarChart3 size={14} />
              Context
            </h3>
            <div className="space-y-5">
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Top Local Issue</label>
                <input
                  type="text"
                  value={data.topLocalIssue}
                  onChange={(e) => update("topLocalIssue", e.target.value)}
                  placeholder="e.g. Water supply, road conditions, cost of living"
                  className="w-full bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
                />
              </div>
              <RadioCards label="Party Brand in This Seat" options={brandOptions} value={data.partyBrand} onChange={(v) => update("partyBrand", v)} />
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Days Until Polling Day</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={data.daysUntilPolling || ""}
                    onChange={(e) => update("daysUntilPolling", parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="flex-1 bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
                  />
                  <span className="text-xs text-[var(--text-muted)]">days</span>
                </div>
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
          {/* CARD 1 — Situation Overview */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-6">
            <h4 className="text-sm font-semibold mb-5 flex items-center gap-2">
              <Shield size={14} className="text-[var(--gold)]" />
              Situation Overview
            </h4>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[var(--bg-elevated)] rounded-xl p-4">
                <p className="text-xs text-[var(--text-muted)] mb-1">Party Brand</p>
                <p className="text-sm font-semibold" style={{ color: data.partyBrand === "Strong tailwind" ? "var(--green)" : data.partyBrand === "Headwind against us" ? "var(--red)" : data.partyBrand ? "var(--amber)" : "var(--text-muted)" }}>
                  {data.partyBrand || "—"}
                </p>
              </div>
              <div className="bg-[var(--bg-elevated)] rounded-xl p-4">
                <p className="text-xs text-[var(--text-muted)] mb-1">Opponent</p>
                <p className="text-sm font-semibold" style={{ color: data.opponentStrength === "Weak" ? "var(--green)" : data.opponentStrength === "Strong — dominant incumbent" ? "var(--red)" : data.opponentStrength ? "var(--amber)" : "var(--text-muted)" }}>
                  {data.opponentStrength || "—"}
                </p>
              </div>
              <div className="bg-[var(--bg-elevated)] rounded-xl p-4">
                <p className="text-xs text-[var(--text-muted)] mb-1">Time Remaining</p>
                <p className="text-sm font-semibold" style={{ color: data.daysUntilPolling > 30 ? "var(--green)" : data.daysUntilPolling > 14 ? "var(--amber)" : data.daysUntilPolling > 0 ? "var(--red)" : "var(--text-muted)" }}>
                  {data.daysUntilPolling > 0 ? `${data.daysUntilPolling} days` : "—"}
                </p>
              </div>
            </div>

            {/* Seat Reality */}
            {situationLabel && (
              <div className="bg-[var(--bg-elevated)] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: situationColor }} />
                  <span className="text-xs font-bold tracking-wider" style={{ color: situationColor }}>
                    SEAT REALITY: {situationLabel}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {situationLabel === "FAVOURABLE" && `${data.classification || "This"} seat with party tailwind against a weak opponent — this is a seat to win. Focus on maximising turnout rather than persuasion.`}
                  {situationLabel === "HOSTILE" && `Challenging terrain: headwind environment against a dominant incumbent in a ${(data.classification || "").toLowerCase()} seat. Every percentage point requires grinding effort on the ground.`}
                  {situationLabel === "UPHILL" && `This won't be easy — you're facing ${data.opponentStrength === "Strong — dominant incumbent" ? "an entrenched incumbent" : "party headwind"} in a ${(data.classification || "").toLowerCase()} constituency. Strategy over brute force is essential.`}
                  {situationLabel === "CONTESTED" && `Genuinely competitive ground — neither side has a structural advantage. This is where campaign quality determines the outcome. Every operational decision counts.`}
                </p>
              </div>
            )}
          </div>

          {/* CARD 2 — Seat Profile */}
          {(data.seatName || data.totalVoters > 0) && (
            <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-6">
              <h4 className="text-sm font-semibold mb-4">Seat Profile</h4>
              <div className="grid grid-cols-2 gap-4">
                {data.seatName && (
                  <div className="bg-[var(--bg-elevated)] rounded-lg p-3">
                    <p className="text-xs text-[var(--text-muted)]">Seat</p>
                    <p className="text-sm font-medium text-white">{data.seatName}</p>
                  </div>
                )}
                {data.seatType && (
                  <div className="bg-[var(--bg-elevated)] rounded-lg p-3">
                    <p className="text-xs text-[var(--text-muted)]">Type</p>
                    <p className="text-sm font-medium text-white">{data.seatType}</p>
                  </div>
                )}
                {data.totalVoters > 0 && (
                  <div className="bg-[var(--bg-elevated)] rounded-lg p-3">
                    <p className="text-xs text-[var(--text-muted)]">Registered Voters</p>
                    <p className="text-sm font-medium text-white">{data.totalVoters.toLocaleString()}</p>
                  </div>
                )}
                {data.candidatesContesting && (
                  <div className="bg-[var(--bg-elevated)] rounded-lg p-3">
                    <p className="text-xs text-[var(--text-muted)]">Candidates</p>
                    <p className="text-sm font-medium text-white">{data.candidatesContesting}-cornered</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CARD 3 — AI Ground Assessment */}
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
                  <span className="text-sm text-[var(--text-secondary)]">Analysing ground intelligence...</span>
                </div>
              ) : aiAssessment ? (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{aiAssessment}</p>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  Fill in your seat type, classification, candidate status, opponent strength, and days remaining to activate the AI ground intelligence assessment.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <FrameworkNav currentFramework={1} />
    </div>
  );
}
