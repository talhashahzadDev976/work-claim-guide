export function RuleChip({ label, value, source }: { label: string; value: string; source?: string }) {
  return (
    <li
      title={source ? `Source: ${source}` : undefined}
      className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm"
    >
      {label}: <span className="font-semibold">{value}</span>
    </li>
  );
}
