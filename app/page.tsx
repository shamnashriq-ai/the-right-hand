import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-black subtle-grid relative overflow-hidden">
      {/* Ambient gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--gold)] opacity-[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 md:px-16 py-6 border-b border-white/[0.06]">
        <div className="text-xl font-bold tracking-tight">
          The <span className="text-[var(--gold)]">Right Hand</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">About</a>
          <a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">Contact</a>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--gold)] opacity-70 mb-8">
          Strategic Intelligence
        </p>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-8">
          Win with intelligence,
          <br />
          <span className="gold-gradient-text">not instinct</span>
        </h1>

        <p className="text-base md:text-lg text-white/40 max-w-xl mb-12">
          The strategic layer between ambition and execution. Built for founders who refuse to guess.
        </p>

        <Link
          href="/strategy/election-type"
          className="group inline-flex items-center gap-3 px-8 py-4 bg-[var(--gold)] text-black font-bold text-sm uppercase tracking-widest rounded-full gold-glow hover:brightness-110 hover:scale-[1.02] transition-all duration-300"
        >
          Build Your Strategy
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-8 md:px-16 py-6 flex items-center justify-between">
        <p className="text-xs text-white/20">&copy; 2026 The Right Hand</p>
        <p className="text-xs text-white/20">Precision over noise.</p>
      </footer>
    </main>
  );
}
