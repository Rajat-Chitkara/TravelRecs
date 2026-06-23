export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2023-08-21" -> "Aug 2023" */
export function formatMonthYear(isoDate: string): string {
  const [year, month] = isoDate.split("-");
  const idx = Number(month) - 1;
  return `${MONTHS[idx] ?? month} ${year}`;
}

export function formatDateRange(earliest: string, latest: string): string {
  return `${formatMonthYear(earliest)} – ${formatMonthYear(latest)}`;
}

export function titleCase(text: string): string {
  return text
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
