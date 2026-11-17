import { fmtEUR } from '@/lib/money';

const SCALE_FLOOR = 25; // never scale tighter than ±25%, even if every month is small
// The chart is laid out in percentages of its box, so it grows with the
// panel (the panel stretches to the hero's height; a fixed-px plot left a
// dead gap above the summary rows).
const ZERO = 58; // % from the top where the zero line sits
const POS_RANGE = 48; // % of the box above the zero line available to the tallest bar
const NEG_RANGE = 28; // % below the zero line for the deepest negative bar

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export interface SavingsRateMonth {
  label: string;
  /** Signed percentage, e.g. 8 or -25. */
  pct: number;
  /** Signed EUR net for the month. */
  net: number;
}

/**
 * Savings rate panel — right cell of the Overview hero row. A signed bar
 * chart (zero line + a scale that fits the data, never tighter than ±25%)
 * plus a three-row ranked summary. Same panel title size, padding and
 * radius as every other Overview panel.
 */
export function SavingsRatePanel({ months, avgRatePct, savingsThisYear }: {
  months: SavingsRateMonth[];
  avgRatePct: number;
  savingsThisYear: number;
}) {
  // A fixed ±25% scale clamps every month above that to the same maxed-out
  // bar height — two real months at +52% and +31% would render identically.
  // Scale to whatever the data actually needs (with headroom), never
  // tighter than ±25%.
  const dataMax = Math.max(SCALE_FLOOR, Math.abs(avgRatePct), ...months.map((m) => Math.abs(m.pct)));
  const scale = Math.ceil((dataMax * 1.1) / 5) * 5;

  const clampedAvg = Math.max(-scale, Math.min(scale, avgRatePct));
  const avgLineTop = clampedAvg >= 0 ? ZERO - (clampedAvg / scale) * POS_RANGE : ZERO + (-clampedAvg / scale) * NEG_RANGE;

  const ranked = [...months].sort((a, b) => b.pct - a.pct);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  const summaryRows: { hue: string; label: string; pct: number; amount: number }[] = [
    { hue: 'var(--indigo)', label: 'Saved this year', pct: Math.round(avgRatePct), amount: savingsThisYear },
    ...(best ? [{ hue: 'var(--teal)', label: 'Best month', pct: Math.round(best.pct), amount: best.net }] : []),
    ...(worst && worst !== best
      ? [{ hue: 'var(--coral)', label: 'Weakest month', pct: Math.round(worst.pct), amount: worst.net }]
      : []),
  ];

  return (
    <div className="glass flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[19px] font-bold -tracking-[0.02em] text-ink">Savings rate</div>
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-indigo/[0.12] px-3 py-1">
          <span className="block h-0 w-4 border-t-2 border-dashed border-indigo" />
          <span className="text-[12px] font-bold text-indigo-dark">Avg {Math.round(avgRatePct)}%</span>
        </div>
      </div>

      <div className="relative mt-4 min-h-[144px] flex-1">
        <div className="absolute inset-x-0 border-t border-[rgba(31,39,66,.22)]" style={{ top: `${ZERO}%` }} />
        <div
          className="absolute inset-x-0 border-t-2 border-dashed border-[rgba(74,92,224,.55)]"
          style={{ top: `${avgLineTop}%` }}
        />
        <div className="absolute inset-0 flex items-stretch gap-2">
          {months.map((m) => {
            const clamped = Math.max(-scale, Math.min(scale, m.pct));
            const positive = clamped >= 0;
            const h = positive ? (clamped / scale) * POS_RANGE : (Math.abs(clamped) / scale) * NEG_RANGE;
            const tone = positive ? 'var(--in)' : 'var(--out)';
            return (
              <div key={m.label} className="relative flex-1" title={`${m.label}: ${fmtEUR(m.net, { decimals: 0 })}`}>
                <div
                  className={'bar absolute left-[14%] right-[14%]' + (positive ? '' : ' bar-negative')}
                  style={{
                    ...(positive ? { bottom: `${100 - ZERO}%` } : { top: `${ZERO}%` }),
                    height: `${h}%`,
                    borderRadius: positive ? '8px 8px 3px 3px' : '3px 3px 8px 8px',
                    background: positive
                      ? 'linear-gradient(180deg,#1fb9a4,#12a08c)'
                      : 'linear-gradient(180deg,#f2708f,#d94a6f)',
                    boxShadow: 'inset 1px 0 0 rgba(255,255,255,.4), inset 0 1px 0 rgba(255,255,255,.35)',
                  }}
                />
                <div
                  className="absolute hidden whitespace-nowrap rounded-[6px] bg-white/70 px-1 py-0.5 text-[12px] font-bold leading-none tabular-nums min-[560px]:inline-block"
                  style={{
                    ...(positive
                      ? { bottom: `calc(${100 - ZERO + h}% + 4px)` }
                      : { top: `calc(${ZERO + h}% + 4px)` }),
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: tone,
                  }}
                >
                  {m.pct > 0 ? '+' : m.pct < 0 ? '−' : ''}
                  {Math.abs(Math.round(m.pct))}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        {months.map((m) => (
          <div key={m.label} className="t-label flex-1 text-center">
            {titleCase(m.label)}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {summaryRows.map((row) => (
          <div
            key={row.label}
            className="glass-tile flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:!bg-white/[0.85]"
          >
            <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: row.hue }} />
            <span className="t-label flex-1 truncate">{row.label}</span>
            <span
              className="shrink-0 text-[14px] font-bold tabular-nums"
              style={{ color: row.pct >= 0 ? 'var(--in)' : 'var(--out)' }}
            >
              {row.pct >= 0 ? '+' : '−'}
              {Math.abs(row.pct)}%
            </span>
            <span
              className="w-[88px] shrink-0 text-right text-[16px] font-extrabold tabular-nums"
              style={{ color: row.amount >= 0 ? 'var(--in)' : 'var(--out)' }}
            >
              {row.amount >= 0 ? '+' : ''}
              {fmtEUR(row.amount, { decimals: 0 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
