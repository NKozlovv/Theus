import type { CSSProperties } from 'react';
import { fmtEUR } from '@/lib/money';

const TRACK = 'rgba(255, 255, 255, 0.62)'; // a glass groove, not a flat grey
const OVERSPEND = '#a8203f'; // darker than --out — matches the inner overspend arc
const R_OUTER = 54;
const R_INNER = 41;
const C_OUTER = 2 * Math.PI * R_OUTER; // 339.29
const C_INNER = 2 * Math.PI * R_INNER; // 257.61

/**
 * Budget ring — spend-of-income for the working month, with an inner arc
 * for the part spent over income. Ring color is decided by this month's
 * savings rate against the YTD average, not fixed thresholds.
 *
 * A small notch on the ring marks where your *average* month ends (100%
 * minus your average savings rate), so the ring answers "ahead or behind
 * my usual pace" by position instead of only by color.
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

  // Notch angle, measured from the ring's start (the SVG itself is rotated
  // -90deg, so 0deg here is 12 o'clock on screen).
  const avgSpendRatio = Math.min(Math.max(1 - avgSavingsRate, 0), 1);
  const notchDeg = avgSpendRatio * 360;

  const caption = over
    ? `Over income by ${Math.round((ratio - 1) * 100)}%`
    : curRatePct >= avgRatePct
      ? `Above your ${Math.round(avgRatePct)}% average`
      : `Below your ${Math.round(avgRatePct)}% average`;

  return (
    <div className="glass-inner flex flex-col gap-4 p-4 transition-colors duration-150 hover:!bg-white/[0.85]">
      <div className="t-label text-center">Spent of income · {monthLabel}</div>

      <div className="relative grid min-h-[112px] max-h-[176px] flex-1 place-items-center">
        <svg
          viewBox="0 0 120 120"
          className="mx-auto h-full w-auto"
          style={{ aspectRatio: '1', maxWidth: '100%', transform: 'rotate(-90deg)' }}
        >
          <circle cx="60" cy="60" r={R_OUTER} fill="none" stroke={TRACK} strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={R_OUTER}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
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
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C_INNER}
            className="ring-over"
            style={{ '--ring': innerOffset } as CSSProperties}
          />
          {income > 0 ? (
            <g transform={`rotate(${notchDeg.toFixed(1)} 60 60)`}>
              <title>{`Your average month ends here (${Math.round(avgSpendRatio * 100)}% of income)`}</title>
              <line
                x1={60 + R_OUTER - 9}
                y1="60"
                x2={60 + R_OUTER + 9}
                y2="60"
                stroke="var(--ink)"
                strokeOpacity="0.7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </g>
          ) : null}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
          <div
            className="text-[clamp(26px,2.3vw,32px)] font-extrabold -tracking-[0.02em] tabular-nums"
            style={{ color }}
          >
            {percentDisplay}%
          </div>
          <div className="max-w-[96px] text-center text-[12px] font-semibold leading-[1.25]" style={{ color }}>
            {caption}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="-mx-2 flex items-center gap-2 rounded-[8px] px-2 py-1 transition-colors duration-150 hover:bg-white/60">
          <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: color }} />
          <span className="t-label flex-1 truncate">Spent</span>
          <span className="shrink-0 text-[14px] font-bold tabular-nums" style={{ color }}>
            {fmtEUR(spent, { decimals: 0 })}
          </span>
        </div>
        <div className="-mx-2 flex items-center gap-2 rounded-[8px] px-2 py-1 transition-colors duration-150 hover:bg-white/60">
          <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: rowTwoColor }} />
          <span className="t-label flex-1 truncate" style={{ color: rowTwoColor }}>
            {over ? 'Over' : 'Left'}
          </span>
          <span className="shrink-0 text-[14px] font-bold tabular-nums" style={{ color: rowTwoColor }}>
            {fmtEUR(Math.abs(left), { decimals: 0 })}
          </span>
        </div>
      </div>
    </div>
  );
}
