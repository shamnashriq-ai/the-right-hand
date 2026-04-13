"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Target, Users, BarChart3, Megaphone, Flame, Shield, Crosshair, ArrowLeft } from "lucide-react";

const frameworks = [
  { id: 1, label: "F1", title: "Know Your Ground", href: "/strategy/know-your-ground", icon: Target },
  { id: 2, label: "F2", title: "Know Your Voters", href: "/strategy/know-your-voters", icon: Users },
  { id: 3, label: "F3", title: "Game of Numbers", href: "/strategy/game-of-numbers", icon: BarChart3 },
  { id: 4, label: "F4", title: "Art of Mobilisation", href: "/strategy/mobilisation", icon: Megaphone },
  { id: 5, label: "F5", title: "Managing Perceptions", href: "/strategy/perceptions", icon: Flame },
  { id: 6, label: "F6", title: "Art of Defence", href: "/strategy/defence", icon: Shield },
  { id: 7, label: "SIM", title: "Adversarial Simulation", href: "/strategy/simulation", icon: Crosshair },
];

export default function StrategyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const currentIdx = frameworks.findIndex((fw) => pathname.startsWith(fw.href));

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Top bar */}
      <header className="border-b border-[rgba(255,255,255,0.06)] bg-[var(--bg-surface)]">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-sm font-medium">
            The <span className="text-[var(--gold)]">Right Hand</span>
          </h1>
          <div className="w-16" />
        </div>

        {/* Framework progress indicator */}
        <div className="max-w-[1440px] mx-auto px-6 pb-4">
          <div className="flex items-center gap-1">
            {frameworks.map((fw, idx) => {
              const isCurrent = idx === currentIdx;
              const isPast = idx < currentIdx;
              const Icon = fw.icon;

              return (
                <div key={fw.id} className="flex items-center flex-1">
                  <Link
                    href={fw.href}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
                      ${isCurrent
                        ? "bg-[var(--gold-dim)] text-[var(--gold)] border border-[var(--gold-border)]"
                        : isPast
                          ? "text-[var(--gold)] opacity-60 hover:opacity-100"
                          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                      }
                    `}
                  >
                    <Icon size={14} />
                    <span className="hidden md:inline">{fw.label}</span>
                  </Link>
                  {idx < frameworks.length - 1 && (
                    <div className={`flex-1 h-px mx-1 ${isPast ? "bg-[var(--gold)]" : "bg-[rgba(255,255,255,0.06)]"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
