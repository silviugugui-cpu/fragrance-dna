import Link from 'next/link';

const profiles = [
  {
    title: 'Olfactory Atlas',
    description: 'A curated set of identity vectors for your scent world.',
  },
  {
    title: 'Signature Archetypes',
    description: 'Encoded preference profiles that map your fragrance taste.',
  },
  {
    title: 'Scent Persona Library',
    description: 'A taxonomy of olfactory identities for refined discovery.',
  },
];

export default function ProfilesPage() {
  return (
    <main className="main-container page-background">
      <section className="glass p-10 space-y-10">
        <div className="space-y-6 max-w-4xl">
          <p className="text-sm uppercase tracking-[0.48em] text-[rgba(165,185,150,0.85)]">Olfactory Archive</p>
          <h1 className="text-5xl font-light tracking-[0.04em] text-[rgba(212,175,120,0.95)]">A systematic scent portfolio</h1>
          <p className="max-w-2xl text-lg leading-9 text-[rgba(190,170,140,0.65)]">
            Explore the core identity vectors that shape your fragrance preferences.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {profiles.map((profile) => (
            <article key={profile.title} className="glass-card p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-[rgba(165,185,150,0.85)]">Identity vector</p>
              <h2 className="mt-4 text-2xl font-semibold text-[rgba(212,175,120,0.95)]">{profile.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[rgba(190,170,140,0.65)]">{profile.description}</p>
            </article>
          ))}
        </div>

        <div className="rounded-[32px] bg-[rgba(20,22,24,0.6)] border border-[rgba(212,175,120,0.15)] p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm uppercase tracking-[0.28em] text-[rgba(165,185,150,0.85)]">Grounding</p>
            <Link
              href="/grounding"
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(212,175,120,0.9),rgba(186,153,110,0.88))] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#1A1A1A] shadow-[0_16px_60px_rgba(212,175,120,0.14)] transition duration-300 hover:brightness-110"
            >
              Initialize scent vector alignment
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
