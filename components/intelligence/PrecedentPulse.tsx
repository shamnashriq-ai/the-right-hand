"use client";

import { useState, useEffect } from "react";

interface PrecedentPulseProps {
  precedent: string | null;
  entryId: string | null;
  onOpenModal: (entryId: string) => void;
}

export default function PrecedentPulse({ precedent, entryId, onOpenModal }: PrecedentPulseProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (precedent) {
      const t = setTimeout(() => setVisible(true), 300);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [precedent]);

  if (!precedent) return null;

  return (
    <div
      className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-[2px] self-stretch bg-[var(--gold)] rounded-full shrink-0" />
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[var(--gold)] tracking-[0.15em] opacity-70">
            GROUNDED IN
          </span>
          <p className="text-[12px] italic text-[var(--gold)] leading-relaxed opacity-90">
            {precedent}
          </p>
          {entryId && (
            <button
              onClick={() => onOpenModal(entryId)}
              className="text-[11px] text-[var(--gold)] opacity-60 hover:opacity-100 transition-opacity mt-1"
            >
              See full case study →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
