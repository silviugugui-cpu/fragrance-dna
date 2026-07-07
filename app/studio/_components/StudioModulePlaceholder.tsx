interface StudioModulePlaceholderProps {
  title: string;
  responsibility: string;
}

export function StudioModulePlaceholder({
  title,
  responsibility,
}: StudioModulePlaceholderProps) {
  return (
    <section className="rounded-xl border border-amber-200/15 bg-zinc-950/75 p-6">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-amber-100">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-amber-50/75">{responsibility}</p>
      </header>

      <div className="rounded-lg border border-dashed border-amber-200/20 bg-zinc-900/65 p-5">
        <p className="text-sm leading-relaxed text-zinc-300">
          Placeholder workspace only. This module route is prepared for future Builder tooling.
          No CRUD, no data editing, and no pipeline business logic is implemented at this milestone.
        </p>
      </div>
    </section>
  );
}
