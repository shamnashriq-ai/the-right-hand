"use client";

import { Target, MapPin, BarChart3, Users } from "lucide-react";
import FrameworkNav from "@/components/FrameworkNav";

export default function KnowYourGround() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold-dim)] border border-[var(--gold-border)] mb-8">
            <Target size={16} className="text-[var(--gold)]" />
            <span className="text-sm font-medium text-[var(--gold)]">Framework 1</span>
          </div>

          <h2 className="text-3xl font-bold mb-4">Know Your Ground</h2>
          <p className="text-[var(--text-secondary)] text-lg mb-12">
            Constituency intelligence and electoral landscape analysis.
            Understand the terrain before you fight.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-12">
            {[
              { icon: MapPin, label: "Constituency mapping" },
              { icon: BarChart3, label: "Electoral history" },
              { icon: Users, label: "Demographic analysis" },
              { icon: Target, label: "Key issue identification" },
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

        <FrameworkNav currentFramework={1} />
      </div>
    </div>
  );
}
