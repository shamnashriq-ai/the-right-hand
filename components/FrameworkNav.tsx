"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

const frameworks = [
  { id: 1, title: "Know Your Ground", href: "/strategy/know-your-ground" },
  { id: 2, title: "Know Your Voters", href: "/strategy/know-your-voters" },
  { id: 3, title: "Game of Numbers", href: "/strategy/game-of-numbers" },
  { id: 4, title: "Art of Mobilisation", href: "/strategy/mobilisation" },
  { id: 5, title: "Managing Perceptions", href: "/strategy/perceptions" },
  { id: 6, title: "Art of Defence", href: "/strategy/defence" },
  { id: 7, title: "Adversarial Simulation", href: "/strategy/simulation" },
];

export default function FrameworkNav({ currentFramework }: { currentFramework: number }) {
  const currentIdx = frameworks.findIndex((fw) => fw.id === currentFramework);
  const prev = currentIdx > 0 ? frameworks[currentIdx - 1] : null;
  const next = currentIdx < frameworks.length - 1 ? frameworks[currentIdx + 1] : null;

  return (
    <div className="border-t border-[rgba(255,255,255,0.06)] mt-12 pt-8 pb-12">
      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
        {prev ? (
          <Link
            href={prev.href}
            className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[var(--bg-surface)] hover:border-[var(--gold-border)] transition-all group"
          >
            <ArrowLeft size={16} className="text-[var(--text-muted)] group-hover:text-[var(--gold)] transition-colors" />
            <div className="text-left">
              <span className="text-xs text-[var(--text-muted)] block">Previous</span>
              <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-white transition-colors">
                F{prev.id} — {prev.title}
              </span>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={next.href}
            className="flex items-center gap-3 px-5 py-3 rounded-xl border border-[var(--gold-border)] bg-[var(--gold-dim)] hover:bg-[rgba(245,166,35,0.25)] transition-all group"
          >
            <div className="text-right">
              <span className="text-xs text-[var(--gold)] block">Next Framework</span>
              <span className="text-sm font-medium text-white">
                F{next.id} — {next.title}
              </span>
            </div>
            <ArrowRight size={16} className="text-[var(--gold)]" />
          </Link>
        ) : (
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
        )}
      </div>
    </div>
  );
}
