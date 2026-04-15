"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { getEntry } from "@/lib/intelligence/library";

interface PrecedentModalProps {
  entryId: string | null;
  open: boolean;
  onClose: () => void;
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

export default function PrecedentModal({ entryId, open, onClose }: PrecedentModalProps) {
  const entry = entryId ? getEntry(entryId) : undefined;

  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, handleEsc]);

  if (!open || !entry) return null;

  const flag = FLAG_MAP[entry.origin] || "";
  const yearDisplay = entry.year < 0 ? `c.${Math.abs(entry.year)} BC` : String(entry.year);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className="relative bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.08)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="space-y-2 pr-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--gold)]">
              {flag} {entry.name}
            </h2>
            <p className="text-sm italic text-[var(--text-secondary)]">{entry.source}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {yearDisplay} | {entry.origin}
            </p>
            <div className="flex gap-2 flex-wrap mt-2">
              {entry.framework_tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold text-[var(--gold)] border border-[var(--gold-border)] rounded px-2 py-0.5 tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Sections */}
          <Section label="CONTEXT" color="text-[var(--text-secondary)]">
            {entry.brief.context}
          </Section>
          <Section label="THE LESSON" color="text-[var(--text-secondary)]">
            {entry.brief.the_lesson}
          </Section>
          <Section label="THE PROOF" color="text-[var(--text-secondary)]">
            {entry.brief.the_proof}
          </Section>
          <Section label="THE WARNING" color="text-[#D97706]">
            {entry.brief.the_warning}
          </Section>
          <Section label="MALAYSIAN PARALLEL" color="text-[var(--gold)] italic">
            {entry.brief.malaysian_parallel}
          </Section>

          {/* Footer */}
          <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-4">
            <p className="text-[11px] text-[var(--text-muted)] italic">{entry.citation_line}</p>
            <button
              onClick={onClose}
              className="shrink-0 text-xs font-semibold text-[var(--gold)] hover:text-white transition-colors"
            >
              Apply this insight to my strategy →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, color, children }: { label: string; color: string; children: string }) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-bold text-[var(--gold)] tracking-[0.15em] opacity-70">
        {label}
      </span>
      <p className={`text-sm leading-relaxed ${color}`}>{children}</p>
    </div>
  );
}
