import Link from "next/link";
import { Shield, Target, Users, Megaphone, BarChart3, Flame } from "lucide-react";

const frameworks = [
  {
    id: 1,
    title: "Know Your Ground",
    description: "Constituency intelligence and electoral landscape analysis",
    icon: Target,
    href: "/strategy/know-your-ground",
    status: "available" as const,
  },
  {
    id: 2,
    title: "Know Your Voters",
    description: "Voter segmentation and sentiment mapping",
    icon: Users,
    href: "/strategy/know-your-voters",
    status: "available" as const,
  },
  {
    id: 3,
    title: "Game of Numbers",
    description: "Vote arithmetic, winning number calculation, and gap analysis",
    icon: BarChart3,
    href: "/strategy/game-of-numbers",
    status: "available" as const,
  },
  {
    id: 4,
    title: "Art of Mobilisation",
    description: "Ground machinery, volunteer tracking, coverage intelligence",
    icon: Megaphone,
    href: "/strategy/mobilisation",
    status: "available" as const,
  },
  {
    id: 5,
    title: "Managing Perceptions",
    description: "Narrative strategy, perception control, and in-situational response",
    icon: Flame,
    href: "/strategy/perceptions",
    status: "available" as const,
  },
  {
    id: 6,
    title: "Art of Defence",
    description: "Opposition research, risk assessment, and rapid response",
    icon: Shield,
    href: "/strategy/defence",
    status: "coming-soon" as const,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-3">
          The <span className="text-[var(--gold)]">Right Hand</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
          Your elite AI campaign strategist. Six frameworks. One mission.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
        {frameworks.map((fw) => {
          const Icon = fw.icon;
          const isComingSoon = fw.status === "coming-soon";

          return (
            <Link
              key={fw.id}
              href={isComingSoon ? "#" : fw.href}
              className={`
                relative block p-6 rounded-xl border transition-all duration-300
                ${isComingSoon
                  ? "bg-[var(--bg-surface)] border-[rgba(255,255,255,0.06)] opacity-50 cursor-not-allowed"
                  : "bg-[var(--bg-surface)] border-[rgba(255,255,255,0.06)] hover:border-[var(--gold-border)]"
                }
              `}
            >
              {isComingSoon && (
                <span className="absolute top-3 right-3 text-xs text-[var(--text-muted)]">
                  COMING SOON
                </span>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[var(--bg-elevated)]">
                  <Icon size={20} className="text-[var(--text-secondary)]" />
                </div>
                <span className="text-xs text-[var(--text-muted)] font-mono">F{fw.id}</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">{fw.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{fw.description}</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
