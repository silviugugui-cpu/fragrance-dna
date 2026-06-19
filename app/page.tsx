import Link from 'next/link';
import FragranceLogo from './components/FragranceLogo';

export default function HomePage() {
  return (
    <main className="main-container hero-background">
      <section className="glass page-panel p-10 space-y-10">
          <div className="flex items-start gap-6 max-w-3xl">
            <div className="shrink-0 flex items-center justify-center">
              <FragranceLogo size="large" />
            </div>
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.48em] text-[rgba(165,185,150,0.85)]">Olfactory Identity</p>
              <h1 className="text-5xl font-light tracking-[0.04em] text-[rgba(212,175,120,0.95)]">
                A single gateway to your <span className="dna-script-font">scent</span> DNA.
              </h1>
              <p className="text-lg leading-9 text-[rgba(190,170,140,0.65)]">Not a catalogue, not a quiz. Enter the FragranceDNA layer and discover the structured profile behind your fragrance identity.</p>
            </div>
          </div>

        <article className="glass-card relative overflow-hidden p-10 transition duration-300 hover:-translate-y-1 hover:shadow-glass-soft">
          <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none bg-[radial-gradient(circle_at_25%_25%,rgba(212,175,120,0.12),transparent_28%),radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.08),transparent_22%)]" />
          <div className="relative space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)]">Olfactory Gateway</p>
            <h2 className="text-4xl font-semibold text-[rgba(212,175,120,0.95)]">Enter your scent mapping layer</h2>
            <p className="max-w-2xl text-base leading-7 text-[rgba(190,170,140,0.65)]">
              Move from vague scent preferences to a clear identity vector that guides every fragrance decision.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/profiles"
                className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(212,175,120,0.94),rgba(186,153,110,0.9))] px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#121212] shadow-[0_20px_70px_rgba(212,175,120,0.18)] transition duration-300 hover:brightness-110"
              >
                Enter Profiles
              </Link>
              <Link
                href="/grounding"
                className="inline-flex items-center justify-center rounded-full border border-[rgba(212,175,120,0.18)] bg-white/5 px-8 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[rgba(212,175,120,0.92)] transition duration-300 hover:bg-white/10"
              >
                Start grounding
              </Link>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
