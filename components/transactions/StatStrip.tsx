import { fmtEUR, txToEUR } from '@/lib/money';
import type { Transaction } from '@/lib/supabase/types';

/**
 * Three stat cards — Money in / Money out / Net for the filtered rows.
 * A label and a figure, nothing else.
 */
export function StatStrip({
  transactions,
  budgetFxRate,
}: {
  transactions: Transaction[];
  budgetFxRate: number;
}) {
  let inEUR = 0;
  let outEUR = 0;
  for (const t of transactions) {
    const eur = txToEUR(t, budgetFxRate);
    if (t.type === 'income') inEUR += eur;
    else if (t.type === 'expense') outEUR += eur;
  }
  const net = inEUR - outEUR;

  const tiles = [
    { label: 'Money in', value: fmtEUR(inEUR), color: 'var(--in)' },
    { label: 'Money out', value: fmtEUR(-outEUR), color: 'var(--ink)' },
    { label: 'Net', value: fmtEUR(net), color: net < 0 ? 'var(--out)' : 'var(--ink)' },
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
