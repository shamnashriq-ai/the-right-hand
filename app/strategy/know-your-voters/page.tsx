"use client";

import { Users, PieChart, Heart, MessageSquare } from "lucide-react";
import FrameworkNav from "@/components/FrameworkNav";

export default function KnowYourVoters() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--gold-dim)] border border-[var(--gold-border)] mb-8">
            <Users size={16} className="text-[var(--gold)]" />
            <span className="text-sm font-medium text-[var(--gold)]">Framework 2</span>
          </div>

          <h2 className="text-3xl font-bold mb-4">Know Your Voters</h2>
          <p className="text-[var(--text-secondary)] text-lg mb-12">
            Voter segmentation and sentiment mapping.
            Know who you need to win.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-12">
            {[
              { icon: PieChart, label: "Voter segmentation" },
              { icon: Heart, label: "Sentiment analysis" },
              { icon: Users, label: "Swing voter identification" },
              { icon: MessageSquare, label: "Issue resonance mapping" },
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

        <FrameworkNav currentFramework={2} />
      </div>
    </div>
  );
}
