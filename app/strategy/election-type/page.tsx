"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type ElectionType = "constituency" | "internal" | null;

// SVG Icons
function ParliamentIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 40h36" />
      <path d="M6 36h36" />
      <path d="M10 36V24" />
      <path d="M18 36V24" />
      <path d="M30 36V24" />
      <path d="M38 36V24" />
      <path d="M6 24h36" />
      <path d="M24 8l18 16H6L24 8z" />
      <circle cx="24" cy="16" r="2" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 28l6-6 8 4 8-8 6 4" />
      <path d="M14 22l-6 2v10l8-4" />
      <path d="M36 18l6 2v10l-8-4" />
      <path d="M20 28l4 4 4-2 4 4" />
      <path d="M16 32l4 4" />
      <circle cx="24" cy="12" r="4" />
      <path d="M20 12h-4l-2 4" />
      <path d="M28 12h4l2 4" />
    </svg>
  );
}

const constituencyPoints = [
  "Public voters \u2014 registered constituency electorate",
  "SPR electoral roll is your voter universe",
  "Campaign machinery covers polling districts",
  "Media, ceramah, and community presence matter",
  "Game decided by thousands of votes",
];

const internalPoints = [
  "Party delegates \u2014 registered members or division reps",
  "Party membership roll is your voter universe",
  "Cultivation happens one delegate at a time",
  "Relationships, access, and patronage are trust triggers",
  "Game decided by dozens or hundreds of delegates",
];

export default function ElectionTypePage() {
  const [selected, setSelected] = useState<ElectionType>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (!selected) return;
    router.push(`/strategy/know-your-ground?election_type=${selected}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress indicator */}
      <div className="max-w-[1440px] mx-auto w-full px-6 pt-6 pb-2">
        <p className="text-xs text-[var(--text-muted)] tracking-wider">
          STEP 0 OF 5 &mdash; NOT YET STARTED
        </p>
      </div>

      {/* Centre content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-3 tracking-tight">
            What are you contesting?
          </h1>
          <p className="text-center text-[var(--text-muted)] text-sm md:text-base mb-12">
            Your strategy architecture depends entirely on this answer.
          </p>

          {/* Two cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Constituency Election */}
            <button
              onClick={() => setSelected("constituency")}
              className={`
                relative text-left p-7 rounded-2xl border-2 transition-all duration-300 group cursor-pointer
                ${selected === "constituency"
                  ? "border-[var(--gold)] bg-[rgba(212,175,55,0.06)]"
                  : "border-[rgba(255,255,255,0.08)] bg-[var(--bg-surface)] hover:border-[var(--gold-border)]"
                }
              `}
            >
              <div className={`mb-5 transition-colors ${selected === "constituency" ? "text-[var(--gold)]" : "text-[var(--text-muted)] group-hover:text-[var(--gold)]"}`}>
                <ParliamentIcon />
              </div>
              <h3 className="text-xl font-bold mb-1">Constituency Election</h3>
              <p className="text-sm text-[var(--text-muted)] mb-5">
                Parliamentary &middot; State &middot; Local Government
              </p>
              <ul className="space-y-2.5">
                {constituencyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
              {selected === "constituency" && (
                <motion.div
                  layoutId="selected-check"
                  className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--gold)] flex items-center justify-center"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 7l3.5 3.5L12 4" />
                  </svg>
                </motion.div>
              )}
            </button>

            {/* Party Internal Election */}
            <button
              onClick={() => setSelected("internal")}
              className={`
                relative text-left p-7 rounded-2xl border-2 transition-all duration-300 group cursor-pointer
                ${selected === "internal"
                  ? "border-[var(--gold)] bg-[rgba(212,175,55,0.06)]"
                  : "border-[rgba(255,255,255,0.08)] bg-[var(--bg-surface)] hover:border-[var(--gold-border)]"
                }
              `}
            >
              <div className={`mb-5 transition-colors ${selected === "internal" ? "text-[var(--gold)]" : "text-[var(--text-muted)] group-hover:text-[var(--gold)]"}`}>
                <HandshakeIcon />
              </div>
              <h3 className="text-xl font-bold mb-1">Party Internal Election</h3>
              <p className="text-sm text-[var(--text-muted)] mb-5">
                Division &middot; Branch &middot; Wing &middot; Supreme Council &middot; Youth Chief
              </p>
              <ul className="space-y-2.5">
                {internalPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
              {selected === "internal" && (
                <motion.div
                  layoutId="selected-check"
                  className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[var(--gold)] flex items-center justify-center"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 7l3.5 3.5L12 4" />
                  </svg>
                </motion.div>
              )}
            </button>
          </div>

          {/* Continue button */}
          <button
            onClick={handleContinue}
            disabled={!selected}
            className={`
              w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3
              ${selected
                ? "bg-[var(--gold)] text-black gold-glow hover:brightness-110 hover:scale-[1.01] cursor-pointer"
                : "bg-[rgba(255,255,255,0.06)] text-[var(--text-muted)] cursor-not-allowed"
              }
            `}
          >
            Continue
            <ArrowRight size={16} />
          </button>

          <p className="text-center text-xs text-[var(--text-muted)] mt-4 opacity-60">
            You can change this later from any screen
          </p>
        </motion.div>
      </div>
    </div>
  );
}
