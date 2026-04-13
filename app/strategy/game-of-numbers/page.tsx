"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart3, Calculator, TrendingUp, Target } from "lucide-react";
import FrameworkNav from "@/components/FrameworkNav";

function GameOfNumbersContent() {
  const searchParams = useSearchParams();
  const electionType = searchParams.get("election_type") || undefined;
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold-dim)] border border-[var(--gold-border)] mb-8">
            <BarChart3 size={16} className="text-[var(--gold)]" />
            <span className="text-sm font-medium text-[var(--gold)]">Framework 3</span>
          </div>

          <h2 className="text-3xl font-bold mb-4">Game of Numbers</h2>
          <p className="text-[var(--text-secondary)] text-lg mb-12">
            Vote arithmetic, winning number calculation, and gap analysis.
            The math that wins elections.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-12">
            {[
              { icon: Calculator, label: "Winning number calc" },
              { icon: TrendingUp, label: "Vote gap analysis" },
              { icon: BarChart3, label: "Turnout modelling" },
              { icon: Target, label: "Target seat analysis" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)]"
              >
                <item.icon size={16} className="text-[var(--gold)]" />
                <span className="text-sm text-[var(--text-secondary)]">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.06)]">
            <div className="w-2 h-2 rounded-full bg-[var(--amber)] animate-pulse" />
            <span className="text-sm text-[var(--text-muted)]">Under construction — coming soon</span>
          </div>
        </div>

        <FrameworkNav currentFramework={3} electionType={electionType} />
      </div>
    </div>
  );
}

export default function GameOfNumbers() {
  return (
    <Suspense>
      <GameOfNumbersContent />
    </Suspense>
  );
}
