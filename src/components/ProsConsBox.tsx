function List({
  items,
  cap,
  prefix,
  textColor,
}: {
  items: string[];
  cap?: number;
  prefix: string;
  textColor: string;
}) {
  const shown = cap ? items.slice(0, cap) : items;
  const remaining = cap ? items.length - cap : 0;
  return (
    <ul className="space-y-1.5 text-sm">
      {shown.map((item, i) => (
        <li key={i} className={textColor}>
          <span className="mr-1.5 font-semibold">{prefix}</span>
          {item}
        </li>
      ))}
      {remaining > 0 && (
        <li className="text-xs font-medium text-muted">+{remaining} more</li>
      )}
    </ul>
  );
}

export function ProsConsBox({ pros, cons }: { pros: string[]; cons: string[] }) {
  if (pros.length === 0 && cons.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {pros.length > 0 && (
        <div className="rounded-lg border border-positive-border bg-positive-bg p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-positive">
            Top pros
          </div>
          <List items={pros} cap={3} prefix="+" textColor="text-foreground" />
        </div>
      )}
      {cons.length > 0 && (
        <div className="rounded-lg border border-negative-border bg-negative-bg p-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-negative">
            Top cons
          </div>
          <List items={cons} cap={3} prefix="−" textColor="text-foreground" />
        </div>
      )}
    </div>
  );
}
