"use client";

import { useState, useEffect } from "react";
import { getEntry } from "@/lib/intelligence/library";
import PrecedentModal from "./PrecedentModal";

interface DigestResult {
  global: string;
  malaysian: string;
  scholar: string;
  global_application: string;
  malaysian_application: string;
  scholar_application: string;
}

const FLAG_MAP: Record<string, string> = {
  USA: "\u{1F1FA}\u{1F1F8}",
  "United States": "\u{1F1FA}\u{1F1F8}",
  Malaysia: "\u{1F1F2}\u{1F1FE}",
  China: "\u{1F1E8}\u{1F1F3}",
  Italy: "\u{1F1EE}\u{1F1F9}",
  "United Kingdom": "\u{1F1EC}\u{1F1E7}",
  UK: "\u{1F1EC}\u{1F1E7}",
};

export default function IntelligenceDigest({ strategyPayload }: { strategyPayload: Record<string, unknown> }) {
  const [digest, setDigest] = useState<DigestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalEntryId, setModalEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (!strategyPayload || Object.keys(strategyPayload).length === 0) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch("/api/strategy/digest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(strategyPayload),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.global && data.malaysian && data.scholar) {
          setDigest(data);
        } else {
          setError(data.error || "Unable to generate intelligence digest.");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Connection error loading intelligence digest.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [strategyPayload]);

  if (!loading && !digest && !error) return null;

  const globalEntry = digest ? getEntry(digest.global) : undefined;
  const malaysianEntry = digest ? getEntry(digest.malaysian) : undefined;
  const scholarEntry = digest ? getEntry(digest.scholar) : undefined;

  return (
    <>
      <div className="mt-8 space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-[var(--gold)] tracking-wide">
            WHAT HISTORY TEACHES ABOUT YOUR SPECIFIC SITUATION
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Three precedents selected from the global intelligence archive based on your exact strategic position.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 py-8">
            <div className="w-4 h-4 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--text-secondary)]">Loading intelligence digest...</span>
          </div>
        )}

        {error && (
          <p className="text-sm text-[var(--text-muted)] text-center py-4">{error}</p>
        )}

        {digest && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Global */}
            {globalEntry && (
              <DigestCard
                label="GLOBAL CAMPAIGN PRECEDENT"
                entry={globalEntry}
                application={digest.global_application}
                onOpenModal={setModalEntryId}
              />
            )}

            {/* Malaysian */}
            {malaysianEntry && (
              <DigestCard
                label="MALAYSIAN CAMPAIGN PRECEDENT"
                entry={malaysianEntry}
                application={digest.malaysian_application}
                onOpenModal={setModalEntryId}
                warm
              />
            )}

            {/* Scholar */}
            {scholarEntry && (
              <DigestCard
                label="SCHOLARLY FRAMEWORK"
                entry={scholarEntry}
                application={digest.scholar_application}
                onOpenModal={setModalEntryId}
                linkText="See framework →"
              />
            )}
          </div>
        )}
      </div>

      <PrecedentModal
        entryId={modalEntryId}
        open={!!modalEntryId}
        onClose={() => setModalEntryId(null)}
      />
    </>
  );
}

function DigestCard({
  label,
  entry,
  application,
  onOpenModal,
  warm,
  linkText = "Full case study →",
}: {
  label: string;
  entry: NonNullable<ReturnType<typeof getEntry>>;
  application: string;
  onOpenModal: (id: string) => void;
  warm?: boolean;
  linkText?: string;
}) {
  const flag = FLAG_MAP[entry.origin] || "";
  const yearDisplay = entry.year < 0 ? `c.${Math.abs(entry.year)} BC` : String(entry.year);

  return (
    <div
      className={`rounded-xl border border-[rgba(255,255,255,0.06)] p-5 space-y-3 ${
        warm ? "bg-[rgba(218,165,32,0.04)]" : "bg-[var(--bg-surface)]"
      }`}
    >
      <span className="text-[10px] font-bold text-[var(--gold)] tracking-[0.12em] opacity-70">
        {label}
      </span>
      <div>
        <p className="text-base font-bold text-[var(--gold)]">
          {flag} {entry.name} · {yearDisplay}
        </p>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{entry.citation_line}</p>
      </div>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{entry.core_insight}</p>
      <p className="text-xs italic text-[var(--text-secondary)] leading-relaxed">{application}</p>
      <button
        onClick={() => onOpenModal(entry.id)}
        className="text-[11px] text-[var(--gold)] opacity-60 hover:opacity-100 transition-opacity"
      >
        {linkText}
      </button>
    </div>
  );
}
