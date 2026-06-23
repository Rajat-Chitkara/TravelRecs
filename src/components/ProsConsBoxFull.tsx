function FullList({ items, prefix }: { items: string[]; prefix: string }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((item, i) => (
        <li key={i} className="text-foreground">
          <span className="mr-1.5 font-semibold">{prefix}</span>
          {item}
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
        <div className="rounded-lg border border-positive-border bg-positive-bg p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-positive">
            Pros
          </div>
          <FullList items={pros} prefix="+" />
        </div>
      )}
      {cons.length > 0 && (
        <div className="rounded-lg border border-negative-border bg-negative-bg p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-negative">
            Cons
          </div>
          <FullList items={cons} prefix="−" />
        </div>
      )}
    </div>
  );
}
