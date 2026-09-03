function FullList({ items, prefix, color }: { items: string[]; prefix: string; color: string }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
          <span className="mt-0.5 shrink-0 text-base font-bold leading-none" style={{ color }}>
            {prefix}
          </span>
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ProsConsBoxFull({ pros, cons }: { pros: string[]; cons: string[] }) {
  if (pros.length === 0 && cons.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {pros.length > 0 && (
        <div className="rounded-xl border border-positive-border bg-positive-bg p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg">👍</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-positive">
              Pros · {pros.length}
            </span>
          </div>
          <FullList items={pros} prefix="+" color="#15803d" />
        </div>
      )}
      {cons.length > 0 && (
        <div className="rounded-xl border border-negative-border bg-negative-bg p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg">👎</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-negative">
              Cons · {cons.length}
            </span>
          </div>
          <FullList items={cons} prefix="−" color="#be123c" />
        </div>
      )}
    </div>
  );
}
