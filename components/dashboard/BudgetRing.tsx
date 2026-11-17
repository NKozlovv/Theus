import type { CSSProperties } from 'react';
import { fmtEUR } from '@/lib/money';

const TRACK = 'rgba(23, 23, 23, 0.08)';
const OVERSPEND = '#8f2a2a'; // darker than --out — matches the inner overspend arc
const R_OUTER = 54;
const R_INNER = 41;
const C_OUTER = 2 * Math.PI * R_OUTER; // 339.29
const C_INNER = 2 * Math.PI * R_INNER; // 257.61

/**
 * Budget ring — spend-of-income for the working month, with an inner arc
 * for the part spent over income. Ring color is decided by this month's
 * savings rate against the YTD average, not fixed thresholds.
 */
export function BudgetRing({
  spent,
  income,
  avgSavingsRate,
  monthLabel,
}: {
  spent: number;
  income: number;
  /** YTD average savings rate, 0–1 (same figure the Savings rate panel labels "Avg"). */
  avgSavingsRate: number;
  monthLabel: string;
}) {
  const ratio = income > 0 ? spent / income : 0;
  const over = ratio > 1;
  const curRatePct = income > 0 ? ((income - spent) / income) * 100 : 0;
  const avgRatePct = avgSavingsRate * 100;
  const color = over || curRatePct < avgRatePct ? 'var(--out)' : 'var(--in)';

  const outerOffset = C_OUTER * (1 - Math.min(ratio, 1));
  const overshootRatio = Math.min(Math.max(ratio - 1, 0), 1);
  const innerOffset = C_INNER * (1 - overshootRatio);

  const percentDisplay = Math.round(ratio * 100);
  const left = income - spent;
  // The "Over" row is specifically the overspend amount — it should match
  // the inner arc's darker red, not the outer ring's --out.
  const rowTwoColor = over ? OVERSPEND : 'var(--in)';

  const caption = over
    ? `Over income by ${Math.round((ratio - 1) * 100)}%`
    : curRatePct >= avgRatePct
      ? `Above your ${Math.round(avgRatePct)}% average`
      : `Below your ${Math.round(avgRatePct)}% average`;

  return (
    <div className="glass-inner flex flex-col gap-3 p-4">
      <div className="text-center text-[12px] text-ink-mute">Spent of income · {monthLabel}</div>

      <div className="relative grid min-h-[104px] max-h-[168px] flex-1 place-items-center">
        <svg
          viewBox="0 0 120 120"
          className="mx-auto h-full w-auto"
          style={{ aspectRatio: '1', maxWidth: '100%', transform: 'rotate(-90deg)' }}
        >
          <circle cx="60" cy="60" r={R_OUTER} fill="none" stroke={TRACK} strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r={R_OUTER}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="butt"
            strokeDasharray={C_OUTER}
            className="ring"
            style={{ '--ring': outerOffset } as CSSProperties}
          />
          <circle
            cx="60"
            cy="60"
            r={R_INNER}
            fill="none"
            stroke={over ? OVERSPEND : 'transparent'}
            strokeWidth="5"
            strokeLinecap="butt"
            strokeDasharray={C_INNER}
            className="ring-over"
            style={{ '--ring': innerOffset } as CSSProperties}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
          <div
            className="text-[clamp(24px,2.3vw,28px)] font-medium leading-none tabular-nums"
            style={{ color }}
          >
            {percentDisplay}%
          </div>
          <div className="max-w-[92px] text-center text-[12px] leading-4 text-ink-mute">{caption}</div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 py-1">
          <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: color }} />
          <span className="flex-1 truncate text-[12px] text-ink-mute">Spent</span>
          <span className="shrink-0 text-[14px] font-medium tabular-nums text-ink">
            {fmtEUR(spent, { decimals: 0 })}
          </span>
        </div>
        <div className="flex items-center gap-2 py-1">
          <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: rowTwoColor }} />
          <span className="flex-1 truncate text-[12px] text-ink-mute">{over ? 'Over' : 'Left'}</span>
          <span className="shrink-0 text-[14px] font-medium tabular-nums" style={{ color: rowTwoColor }}>
            {fmtEUR(Math.abs(left), { decimals: 0 })}
          </span>
        </div>
      </div>
    </div>
  );
}
