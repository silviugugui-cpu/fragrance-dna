const cards = [
  {
    title: "Raw Database",
    description: "Source ingestion health, workbook contracts, and import readiness.",
  },
  {
    title: "Builder Status",
    description: "Current Builder milestone posture and operational readiness.",
  },
  {
    title: "Knowledge Base",
    description: "Canonical entities and note matching contract surfaces.",
  },
  {
    title: "Master Database",
    description: "Master Perfume Object publication and governance readiness.",
  },
  {
    title: "Pipeline",
    description: "Stage contract orchestration and dependency visibility.",
  },
  {
    title: "Validation",
    description: "Quality gates, schema checks, and contract compliance snapshots.",
  },
  {
    title: "Recent Activity",
    description: "Internal Studio activity feed placeholder for future audit trails.",
  },
];

export function StudioDashboard() {
  return (
    <section className="space-y-6">
      <header className="rounded-xl border border-amber-200/15 bg-zinc-950/75 p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-amber-100">
          FragranceDNA Studio Dashboard
        </h1>
        <p className="mt-2 max-w-4xl text-sm text-amber-50/75">
          Internal Builder workspace for constructing and governing the FragranceDNA knowledge base
          and canonical master database contracts.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-xl border border-amber-200/15 bg-zinc-950/70 p-5"
          >
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-200/90">
              {card.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{card.description}</p>
            <p className="mt-4 text-xs font-medium text-zinc-500">Placeholder only</p>
          </article>
        ))}
      </div>
    </section>
  );
}
