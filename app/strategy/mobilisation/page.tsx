"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users, MapPin, Calendar, Phone, Megaphone, TrendingUp,
  AlertTriangle, Target, Zap, Award, Star, Brain, ArrowRight,
  Activity, BarChart3
} from "lucide-react";
import FrameworkNav from "@/components/FrameworkNav";
import PrecedentPulse from "@/components/intelligence/PrecedentPulse";
import PrecedentModal from "@/components/intelligence/PrecedentModal";

// ─── Types ───
interface MobilisationData {
  volunteers: number;
  branches: number;
  coveredDistricts: number;
  totalDistricts: number;
  daysRemaining: number;
  contactsYesterday: number;
  newDistrictsThisWeek: number;
  roadshowsThisWeek: number;
  leadersActivated: number;
  ageProfile: string;
  mobilisationChannel: string;
  votesNeeded: number;
  topPerformer: string;
}

const defaultData: MobilisationData = {
  volunteers: 0,
  branches: 0,
  coveredDistricts: 0,
  totalDistricts: 0,
  daysRemaining: 0,
  contactsYesterday: 0,
  newDistrictsThisWeek: 0,
  roadshowsThisWeek: 0,
  leadersActivated: 0,
  ageProfile: "",
  mobilisationChannel: "",
  votesNeeded: 0,
  topPerformer: "",
};

const ageOptions = [
  "Mostly youth (18-35)",
  "Mixed age groups",
  "Mostly senior (35+)",
];

const channelOptions = [
  "Door-to-door canvassing",
  "WhatsApp network",
  "Ceramah and roadshows",
  "Community leader network",
  "Mixed approach",
];

// ─── Helpers ───
function getStatusColor(value: number, greenThreshold: number, amberThreshold: number, inverted = false) {
  if (inverted) {
    if (value > greenThreshold) return "var(--gold)";
    if (value > amberThreshold) return "var(--amber)";
    return "var(--red)";
  }
  if (value >= greenThreshold) return "var(--green)";
  if (value >= amberThreshold) return "var(--amber)";
  return "var(--red)";
}

function getCoverageBorder(gapPercent: number) {
  if (gapPercent > 30) return "border-[var(--red)]";
  if (gapPercent > 15) return "border-[var(--amber)]";
  return "border-[var(--green)]";
}

// ─── Components ───

function NumberInput({
  label,
  icon: Icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="p-2 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] group-focus-within:text-[var(--gold)] transition-colors">
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <label className="text-xs text-[var(--text-muted)] block mb-1">{label}</label>
        <input
          type="number"
          min={0}
          value={value || ""}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          placeholder="0"
          className="w-full bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
        />
      </div>
    </div>
  );
}

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

function MetricCard({
  label,
  value,
  color,
  suffix,
}: {
  label: string;
  value: string | number;
  color: string;
  suffix?: string;
}) {
  return (
    <div className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[rgba(255,255,255,0.06)]">
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
        {suffix && <span className="text-sm font-normal ml-1">{suffix}</span>}
      </p>
    </div>
  );
}

// ─── Main Page ───
function MobilisationPageContent() {
  const searchParams = useSearchParams();
  const electionType = searchParams.get("election_type") || undefined;
  const [data, setData] = useState<MobilisationData>(defaultData);
  const [aiAssessment, setAiAssessment] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [mobPrecedent, setMobPrecedent] = useState<string | null>(null);
  const [mobEntryId, setMobEntryId] = useState<string | null>(null);
  const [modalEntryId, setModalEntryId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback((field: keyof MobilisationData, value: number | string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Derived values
  const coveragePercent = data.totalDistricts > 0 ? (data.coveredDistricts / data.totalDistricts) * 100 : 0;
  const uncoveredDistricts = Math.max(0, data.totalDistricts - data.coveredDistricts);
  const gapPercent = data.totalDistricts > 0 ? (uncoveredDistricts / data.totalDistricts) * 100 : 0;
  const volunteersPerDistrict = data.coveredDistricts > 0 ? (data.volunteers / data.coveredDistricts) : 0;
  const dailyContactsRequired = data.daysRemaining > 0 ? Math.ceil(data.votesNeeded / data.daysRemaining) : 0;
  const paceStatus = dailyContactsRequired === 0 ? "ENTER DATA" : data.contactsYesterday >= dailyContactsRequired ? (data.contactsYesterday > dailyContactsRequired * 1.1 ? "AHEAD" : "ON PACE") : "BEHIND";
  const weeklyExpansionRate = data.newDistrictsThisWeek || 0;
  const weeksToFullCoverage = weeklyExpansionRate > 0 ? Math.ceil(uncoveredDistricts / weeklyExpansionRate) : Infinity;
  const daysToFullCoverage = weeksToFullCoverage * 7;

  // Coverage milestones
  const milestones = [50, 75, 100];
  const nextMilestone = milestones.find((m) => coveragePercent < m) || 100;
  const districtsForMilestone = Math.ceil((nextMilestone / 100) * data.totalDistricts);
  const districtsNeededForMilestone = Math.max(0, districtsForMilestone - data.coveredDistricts);
  const daysToMilestone = weeklyExpansionRate > 0 ? Math.ceil((districtsNeededForMilestone / weeklyExpansionRate) * 7) : 0;

  // Mission brief
  const missionBrief = data.daysRemaining > 0 && dailyContactsRequired > 0
    ? `Today: ${dailyContactsRequired} voter contacts needed. ${uncoveredDistricts > 0 ? `Focus on the ${Math.min(uncoveredDistricts, 2)} uncovered district${uncoveredDistricts > 1 ? "s" : ""}.` : "All districts covered — maximise depth."}`
    : "Enter your mobilisation data to generate today's mission.";

  // AI assessment
  useEffect(() => {
    if (data.volunteers > 0 && data.daysRemaining > 0) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setAiLoading(true);
        try {
          const res = await fetch("/api/strategy/mobilisation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...data,
              coveragePercent: coveragePercent.toFixed(1),
              uncoveredDistricts,
              volunteersPerDistrict: volunteersPerDistrict.toFixed(1),
              dailyContactsRequired,
              paceStatus,
              gapPercent: gapPercent.toFixed(1),
            }),
          });
          const result = await res.json();
          setAiAssessment(result.assessment || "Unable to generate assessment.");
          setMobPrecedent(result.precedent || null);
          setMobEntryId(result.precedent_entry_id || null);
        } catch {
          setAiAssessment("Connection error. Check your network and try again.");
        } finally {
          setAiLoading(false);
        }
      }, 1200);
    }
  }, [data, coveragePercent, uncoveredDistricts, volunteersPerDistrict, dailyContactsRequired, paceStatus, gapPercent]);

  // Read vote gap from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const voteGap = params.get("voteGap");
    if (voteGap) update("votesNeeded", parseInt(voteGap) || 0);
  }, [update]);

  const contactBarWidth = dailyContactsRequired > 0
    ? Math.min(100, (data.contactsYesterday / dailyContactsRequired) * 100)
    : 0;

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
            <Megaphone size={20} className="text-[var(--gold)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Art of Mobilisation</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Framework 4 — Ground machinery management and operational targeting
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
          {/* Section A — Machinery Inventory */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h3 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
              <Users size={14} />
              Machinery Inventory
            </h3>
            <div className="space-y-4">
              <NumberInput label="Active volunteers registered" icon={Users} value={data.volunteers} onChange={(v) => update("volunteers", v)} />
              <NumberInput label="Campaign branches / operation rooms" icon={MapPin} value={data.branches} onChange={(v) => update("branches", v)} />
              <NumberInput label="Polling districts with active coverage" icon={Target} value={data.coveredDistricts} onChange={(v) => update("coveredDistricts", v)} />
              <NumberInput label="Total polling districts in seat" icon={MapPin} value={data.totalDistricts} onChange={(v) => update("totalDistricts", v)} />
              <NumberInput label="Days remaining to polling day" icon={Calendar} value={data.daysRemaining} onChange={(v) => update("daysRemaining", v)} />
            </div>
          </div>

          {/* Section B — Daily Performance */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h3 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
              <Activity size={14} />
              Daily Performance
            </h3>
            <div className="space-y-4">
              <NumberInput label="Voter contacts made yesterday" icon={Phone} value={data.contactsYesterday} onChange={(v) => update("contactsYesterday", v)} />
              <NumberInput label="New polling districts covered this week" icon={TrendingUp} value={data.newDistrictsThisWeek} onChange={(v) => update("newDistrictsThisWeek", v)} />
              <NumberInput label="Roadshows / ceramah held this week" icon={Megaphone} value={data.roadshowsThisWeek} onChange={(v) => update("roadshowsThisWeek", v)} />
              <NumberInput label="Community leaders activated" icon={Star} value={data.leadersActivated} onChange={(v) => update("leadersActivated", v)} />
            </div>
          </div>

          {/* Section C — Machinery Profile */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h3 className="text-sm font-semibold text-[var(--gold)] mb-4 flex items-center gap-2">
              <Zap size={14} />
              Machinery Profile
            </h3>
            <div className="space-y-5">
              <RadioCards
                label="Volunteer age profile"
                options={ageOptions}
                value={data.ageProfile}
                onChange={(v) => update("ageProfile", v)}
              />
              <RadioCards
                label="Primary mobilisation channel"
                options={channelOptions}
                value={data.mobilisationChannel}
                onChange={(v) => update("mobilisationChannel", v)}
              />
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
          {/* CARD 1 — Machinery Scorecard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="Ground Coverage"
              value={data.totalDistricts > 0 ? `${coveragePercent.toFixed(0)}` : "—"}
              suffix="%"
              color={data.totalDistricts > 0 ? getStatusColor(coveragePercent, 70, 40) : "var(--text-muted)"}
            />
            <MetricCard
              label="Daily Contact Rate"
              value={data.contactsYesterday || "—"}
              color={data.contactsYesterday > 0 ? "var(--text-primary)" : "var(--text-muted)"}
            />
            <MetricCard
              label="Days Remaining"
              value={data.daysRemaining || "—"}
              color={data.daysRemaining > 0 ? getStatusColor(data.daysRemaining, 21, 10, true) : "var(--text-muted)"}
            />
            <MetricCard
              label="Volunteers / District"
              value={data.coveredDistricts > 0 ? volunteersPerDistrict.toFixed(1) : "—"}
              color={data.coveredDistricts > 0 ? "var(--text-primary)" : "var(--text-muted)"}
            />
          </div>

          {/* CARD 2 — Coverage Gap Alert */}
          <div className={`bg-[var(--bg-surface)] rounded-xl border-2 p-5 transition-colors ${data.totalDistricts > 0 ? getCoverageBorder(gapPercent) : "border-[rgba(255,255,255,0.06)]"}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                className={gapPercent > 30 ? "text-[var(--red)]" : gapPercent > 15 ? "text-[var(--amber)]" : "text-[var(--green)]"}
              />
              <div className="flex-1">
                <h4 className="text-sm font-semibold mb-2">Coverage Gap Alert</h4>
                {data.totalDistricts > 0 ? (
                  <>
                    <p className="text-2xl font-bold mb-1" style={{ color: gapPercent > 30 ? "var(--red)" : gapPercent > 15 ? "var(--amber)" : "var(--green)" }}>
                      {uncoveredDistricts} polling district{uncoveredDistricts !== 1 ? "s" : ""} have NO active machinery
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {weeklyExpansionRate > 0
                        ? `At current expansion rate, full coverage by Day ${daysToFullCoverage > data.daysRemaining ? `${daysToFullCoverage} (⚠ exceeds remaining days)` : daysToFullCoverage}`
                        : "No expansion data yet — enter new districts covered this week."}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">Enter total polling districts to see coverage gap analysis.</p>
                )}
              </div>
            </div>
          </div>

          {/* CARD 3 — Daily Operational Target */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Target size={14} className="text-[var(--gold)]" />
              Daily Operational Target
            </h4>

            {/* Votes needed input if not from URL */}
            <div className="mb-4">
              <NumberInput
                label="Votes still needed (from Game of Numbers or manual)"
                icon={BarChart3}
                value={data.votesNeeded}
                onChange={(v) => update("votesNeeded", v)}
              />
            </div>

            {data.votesNeeded > 0 && data.daysRemaining > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--bg-elevated)] rounded-lg p-3">
                    <p className="text-xs text-[var(--text-muted)]">Daily contacts required</p>
                    <p className="text-xl font-bold text-white">{dailyContactsRequired}</p>
                  </div>
                  <div className="bg-[var(--bg-elevated)] rounded-lg p-3">
                    <p className="text-xs text-[var(--text-muted)]">Current daily rate</p>
                    <p className="text-xl font-bold text-white">{data.contactsYesterday}</p>
                  </div>
                </div>

                {/* Pace status */}
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: paceStatus === "AHEAD" ? "var(--gold-dim)" : paceStatus === "ON PACE" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                      color: paceStatus === "AHEAD" ? "var(--gold)" : paceStatus === "ON PACE" ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {paceStatus}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {paceStatus === "BEHIND"
                      ? `Need ${dailyContactsRequired - data.contactsYesterday} more contacts/day`
                      : paceStatus === "AHEAD"
                        ? `${data.contactsYesterday - dailyContactsRequired} ahead of target`
                        : "Matching required pace"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="relative h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${contactBarWidth}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{
                      background: paceStatus === "AHEAD" ? "var(--gold)" : paceStatus === "ON PACE" ? "var(--green)" : "var(--red)",
                    }}
                  />
                  {/* Target line */}
                  <div className="absolute top-0 right-0 h-full w-px bg-white opacity-30" style={{ left: "100%" }} />
                </div>
                <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                  <span>0</span>
                  <span>Required: {dailyContactsRequired}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">Enter votes needed and days remaining to see daily targets.</p>
            )}
          </div>

          {/* CARD 4 — INSPIRE · ACCELERATE · INCENTIFY · REWARD */}
          <div className="grid grid-cols-2 gap-3">
            {/* INSPIRE */}
            <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-[var(--gold)]" />
                <span className="text-xs font-semibold text-[var(--gold)]">INSPIRE</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Daily mission brief</p>
              <p className="text-sm text-white leading-relaxed">{missionBrief}</p>
            </div>

            {/* ACCELERATE */}
            <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight size={14} className="text-[var(--gold)]" />
                <span className="text-xs font-semibold text-[var(--gold)]">ACCELERATE</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Route priority</p>
              {uncoveredDistricts > 0 ? (
                <p className="text-sm text-white">
                  {uncoveredDistricts} uncovered area{uncoveredDistricts !== 1 ? "s" : ""} remaining.
                  {weeklyExpansionRate > 0
                    ? ` Deploy ${Math.min(2, uncoveredDistricts)} team${Math.min(2, uncoveredDistricts) > 1 ? "s" : ""} to close the gap.`
                    : " No expansion recorded this week."}
                </p>
              ) : data.totalDistricts > 0 ? (
                <p className="text-sm text-[var(--green)]">Full coverage achieved. Focus on depth.</p>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">Enter district data to see route priority.</p>
              )}
            </div>

            {/* INCENTIFY */}
            <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award size={14} className="text-[var(--gold)]" />
                <span className="text-xs font-semibold text-[var(--gold)]">INCENTIFY</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-2">Top performer spotlight</p>
              <input
                type="text"
                placeholder="Enter team/volunteer name"
                value={data.topPerformer}
                onChange={(e) => update("topPerformer", e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-border)] transition-colors"
              />
              {data.topPerformer && (
                <p className="text-sm text-[var(--gold)] mt-2 flex items-center gap-1">
                  <Star size={12} /> {data.topPerformer}
                </p>
              )}
            </div>

            {/* REWARD */}
            <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-[var(--gold)]" />
                <span className="text-xs font-semibold text-[var(--gold)]">REWARD</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Days to milestone</p>
              {data.totalDistricts > 0 && data.coveredDistricts > 0 ? (
                <div>
                  <p className="text-sm text-white">
                    Next: <span className="text-[var(--gold)] font-semibold">{nextMilestone}%</span> coverage
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {districtsNeededForMilestone > 0
                      ? `${districtsNeededForMilestone} more district${districtsNeededForMilestone !== 1 ? "s" : ""} needed${daysToMilestone > 0 ? ` (~${daysToMilestone} days)` : ""}`
                      : "Milestone reached!"}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">Enter district data to see milestones.</p>
              )}
            </div>
          </div>

          {/* CARD 5 — AI Mobilisation Assessment */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[rgba(255,255,255,0.06)] p-5 relative overflow-hidden">
            {/* Gold left border */}
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
                <>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{aiAssessment}</p>
                  <PrecedentPulse precedent={mobPrecedent} entryId={mobEntryId} onOpenModal={setModalEntryId} />
                </>

              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  Enter your volunteer count and days remaining to activate the AI ground intelligence assessment.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <FrameworkNav currentFramework={4} electionType={electionType} />
      <PrecedentModal entryId={modalEntryId} open={!!modalEntryId} onClose={() => setModalEntryId(null)} />
    </div>
  );
}

export default function MobilisationPage() {
  return (
    <Suspense>
      <MobilisationPageContent />
    </Suspense>
  );
}
