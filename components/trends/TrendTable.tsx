'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui';
import { fmtEUR } from '@/lib/money';
import { categoryColor, tint } from '@/lib/categoryColor';
import { cn } from '@/lib/utils';
import type { CategoryTrendRow, SubcategoryTrendRow, TrendMonth } from '@/lib/categories/monthlyTrend';

const NAME_COL = 'minmax(160px,1.3fr)';
const STAT_COL = 'minmax(64px,84px)';

/**
 * The category × month matrix. Exactly two hues (--in / --out), both
 * measured against a *row's own* average across the shown months — depth
 * is distance from that category's average, not spend volume. The tint
 * stays light enough for ink text on every cell. The category hue survives
 * only as the small square in the row label. Column totals sit above a
 * double rule.
 *
 * Laid out as a CSS grid rather than an HTML table with a fixed min-width
 * + horizontal scroll: the month columns are `fr` units, so the whole
 * grid always fills the panel's full width and each column gets
 * proportionally wider or narrower as months are added across the year,
 * instead of leaving dead space in January and overflowing by December.
 * That also means no sticky columns are needed — nothing scrolls
 * horizontally — so the category/avg/year cells sit directly on the card
 * like every other label in the app.
 */
export function TrendTable({
  rows,
  months,
  visibleCount,
  avgMonths,
}: {
  rows: CategoryTrendRow[];
  /** Includes one leading month used only as the first visible column's delta baseline. */
  months: TrendMonth[];
  visibleCount: number;
  /** Visible months that have any data — the Avg divisor (lib/activeMonths.ts). */
  avgMonths: number;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const offset = months.length - visibleCount;
  const visibleMonths = months.slice(offset);
  const gridTemplateColumns = `${NAME_COL} repeat(${visibleCount}, minmax(0,1fr)) ${STAT_COL} ${STAT_COL}`;

  if (rows.length === 0) {
    return (
      <div className="glass px-6 py-16 text-center text-[14px] text-ink-mute">
        No expense activity in this year yet.
      </div>
    );
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function sums(values: number[]) {
    const visibleTotal = Array.from({ length: visibleCount }, (_, j) => values[offset + j] ?? 0).reduce(
      (s, v) => s + v,
      0,
    );
    const avg = avgMonths > 0 ? visibleTotal / avgMonths : 0;
    return { visibleTotal, avg };
  }

  const footer = visibleMonths.map((_, j) => {
    const idx = offset + j;
    return rows.reduce((s, r) => s + (r.values[idx] ?? 0), 0);
  });
  const footerTotal = footer.reduce((s, v) => s + v, 0);
  const footerAvg = avgMonths > 0 ? footerTotal / avgMonths : 0;

  return (
    <div className="glass p-4">
      <div style={{ gridTemplateColumns }} className="grid gap-1 px-2 pb-2">
        <span className="text-[12px] font-medium text-ink-mute">Category</span>
        {visibleMonths.map((m) => (
          <span
            key={`${m.year}-${m.month}`}
            className="whitespace-nowrap text-right text-[12px] font-medium text-ink-mute"
          >
            {m.label}
          </span>
        ))}
        <span className="whitespace-nowrap text-right text-[12px] font-medium text-ink-mute">
          Avg
        </span>
        <span className="whitespace-nowrap text-right text-[12px] font-medium text-ink-mute">
          Year
        </span>
      </div>

      <div className="flex flex-col gap-1 border-t border-line pt-2">
        {rows.map((row) => {
          const { visibleTotal, avg } = sums(row.values);
          const hue = categoryColor(row.category.name);
          const isOpen = expanded.has(row.category.id);
          const hasSubs = row.subs.length > 0;
          return (
            <div key={row.category.id}>
              <div
                role={hasSubs ? 'button' : undefined}
                tabIndex={hasSubs ? 0 : undefined}
                onClick={hasSubs ? () => toggle(row.category.id) : undefined}
                onKeyDown={
                  hasSubs
                    ? (e) => {
                        if (e.key === 'Enter') toggle(row.category.id);
                      }
                    : undefined
                }
                style={{ gridTemplateColumns }}
                className={cn(
                  'grid items-center gap-1 rounded-[8px] px-2 py-1',
                  hasSubs && 'cursor-pointer transition-colors duration-150 hover:bg-raised',
                )}
              >
                <span className="flex min-w-0 items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: hue }} />
                    <span className="truncate text-[14px] font-medium text-ink">{row.category.name}</span>
                  </span>
                  {hasSubs ? (
                    <Icon
                      name="chevron-down"
                      size={14}
                      className={cn('shrink-0 text-ink-mute transition-transform duration-150 ease-theus', isOpen && 'rotate-180')}
                    />
                  ) : null}
                </span>
                {Array.from({ length: visibleCount }, (_, j) => {
                  const idx = offset + j;
                  const curr = row.values[idx] ?? 0;
                  const prev = row.values[idx - 1] ?? 0;
                  return <ValueCell key={j} value={curr} prev={prev} avg={avg} />;
                })}
                <span className="whitespace-nowrap text-right text-[14px] tabular-nums text-ink-soft">
                  {fmtEUR(avg, { decimals: 0 })}
                </span>
                <span className="whitespace-nowrap text-right text-[14px] font-medium tabular-nums text-ink">
                  {fmtEUR(visibleTotal, { decimals: 0 })}
                </span>
              </div>

              {isOpen
                ? row.subs.map((sub) => (
                    <SubRow key={sub.name} sub={sub} gridTemplateColumns={gridTemplateColumns} offset={offset} visibleCount={visibleCount} sums={sums} />
                  ))
                : null}
            </div>
          );
        })}
      </div>

      <div style={{ gridTemplateColumns }} className="mt-2 grid items-start gap-1 border-t border-line px-2 pt-3">
        <span className="text-[14px] font-medium text-ink">All categories</span>
        {footer.map((v, j) => (
          <span key={j} className="double-rule whitespace-nowrap text-right text-[14px] font-medium tabular-nums text-ink">
            {fmtEUR(v, { decimals: 0 })}
          </span>
        ))}
        <span className="double-rule whitespace-nowrap text-right text-[14px] tabular-nums text-ink-soft">
          {fmtEUR(footerAvg, { decimals: 0 })}
        </span>
        <span className="double-rule whitespace-nowrap text-right text-[14px] font-medium tabular-nums text-ink">
          {fmtEUR(footerTotal, { decimals: 0 })}
        </span>
      </div>
    </div>
  );
}

function SubRow({
  sub,
  gridTemplateColumns,
  offset,
  visibleCount,
  sums,
}: {
  sub: SubcategoryTrendRow;
  gridTemplateColumns: string;
  offset: number;
  visibleCount: number;
  sums: (values: number[]) => { visibleTotal: number; avg: number };
}) {
  const { visibleTotal, avg } = sums(sub.values);
  return (
    <div style={{ gridTemplateColumns }} className="grid items-center gap-1 rounded-[8px] px-2 py-1">
      <span className="truncate pl-4 text-[13px] text-ink-soft">{sub.name}</span>
      {Array.from({ length: visibleCount }, (_, j) => {
        const idx = offset + j;
        const curr = sub.values[idx] ?? 0;
        const prev = sub.values[idx - 1] ?? 0;
        return <ValueCell key={j} value={curr} prev={prev} avg={avg} compact />;
      })}
      <span className="whitespace-nowrap text-right text-[12px] tabular-nums text-ink-mute">
        {fmtEUR(avg, { decimals: 0 })}
      </span>
      <span className="whitespace-nowrap text-right text-[12px] font-medium tabular-nums text-ink-soft">
        {fmtEUR(visibleTotal, { decimals: 0 })}
      </span>
    </div>
  );
}

function ValueCell({ value, prev, avg, compact }: { value: number; prev: number; avg: number; compact?: boolean }) {
  const ratio = avg > 0 ? value / avg : value > 0 ? 2 : 1;
  const isZero = Math.abs(value) < 0.005;

  // Tint depth is capped at .42 so ink text keeps 4.5:1 on every cell.
  let bg = 'rgba(23,23,23,.04)'; // "on plan"
  if (!isZero && avg > 0) {
    const alpha = Math.min(0.42, Math.max(0.1, Math.abs(ratio - 1) * 0.9));
    if (ratio > 1.02) bg = tint('#bf4040', alpha);
    else if (ratio < 0.98) bg = tint('#1f7a52', alpha);
  }

  const momPct = Math.abs(prev) > 0.005 ? ((value - prev) / Math.abs(prev)) * 100 : value > 0 ? Infinity : 0;
  const arrow = momPct > 8 ? '▲' : momPct < -8 ? '▼' : '·';
  const pctVsAvg = avg > 0 ? Math.round((ratio - 1) * 100) : 0;

  return (
    <div
      className={cn(
        'cursor-default whitespace-nowrap rounded-[6px] px-2 text-right tabular-nums transition-shadow duration-150 hover:shadow-[inset_0_0_0_1px_rgba(23,23,23,.28)]',
        compact ? 'py-1.5 text-[12px]' : 'py-2.5 text-[14px] font-medium',
        'text-ink',
      )}
      style={{ background: bg }}
      title={`${fmtEUR(value, { decimals: 0 })}${avg > 0 ? ` · ${pctVsAvg >= 0 ? '+' : ''}${pctVsAvg}% vs average` : ''}`}
    >
      {isZero ? (
        <span className="opacity-40">—</span>
      ) : (
        <>
          {fmtEUR(value, { decimals: 0 })} <span className="text-[12px] opacity-60">{arrow}</span>
        </>
      )}
    </div>
  );
}
