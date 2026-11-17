import { fmtEUR } from '@/lib/money';
import type { CategorySummary } from '@/lib/categories/summary';

/**
 * Three stat cards — spent this month, YTD average, pace against average.
 * A label and a figure each. Expense categories only; income has its own
 * recap section below the table.
 */
export function CategoriesSummaryCard({
  summaries,
  monthLabel,
}: {
  summaries: CategorySummary[];
  monthLabel: string;
}) {
  const totalThisMonth = summaries.reduce((s, x) => s + x.thisMonth, 0);
  const totalAvg = summaries.reduce((s, x) => s + x.avgMonthly, 0);
  const pace = totalThisMonth - totalAvg;
  const over = pace > 0;

  const tiles = [
    { label: `Spent in ${monthLabel}`, value: fmtEUR(totalThisMonth, { decimals: 0 }), color: 'var(--ink)' },
    { label: 'YTD average per month', value: fmtEUR(totalAvg, { decimals: 0 }), color: 'var(--ink)' },
    {
      label: over ? 'Over pace by' : 'Under pace by',
      value: `${pace >= 0 ? '+' : ''}${fmtEUR(pace, { decimals: 0 })}`,
      color: over ? 'var(--out)' : 'var(--in)',
    },
  ];

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="glass p-5">
          <div className="text-[13px] text-ink-mute">{tile.label}</div>
          <div
            className="mt-2 text-[28px] font-medium leading-none tabular-nums"
            style={{ color: tile.color }}
          >
            {tile.value}
          </div>
        </div>
      ))}
    </div>
  );
}
