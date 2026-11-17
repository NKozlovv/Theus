import { fmtEUR } from '@/lib/money';

const SCALE_FLOOR = 25; // never scale tighter than ±25%, even if every month is small
const POS_H = 72; // px headroom above the zero line
const BASE = 72; // px below the zero line, down to the month-label row
const NEG_H = 44; // px max height for the deepest negative bar

export interface SavingsRateMonth {
  label: string;
  /** Signed percentage, e.g. 8 or -25. */
  pct: number;
  /** Signed EUR net for the month. */
  net: number;
}

/**
 * Savings rate panel — right cell of the Overview's first row. A signed
 * bar chart on a zero line (scaled to the data, never tighter than ±25%)
 * plus a three-row ranked summary. Bars are neutral; the most recent
 * month takes the accent and a month below zero keeps the loss color.
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
  const avgLineTop = POS_H - (clampedAvg / scale) * POS_H;

  const ranked = [...months].sort((a, b) => b.pct - a.pct);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  const summaryRows: { label: string; pct: number; amount: number }[] = [
    { label: 'Saved this year', pct: Math.round(avgRatePct), amount: savingsThisYear },
    ...(best ? [{ label: 'Best month', pct: Math.round(best.pct), amount: best.net }] : []),
    ...(worst && worst !== best ? [{ label: 'Weakest month', pct: Math.round(worst.pct), amount: worst.net }] : []),
  ];

  return (
    <div className="glass flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[16px] font-medium text-ink">Savings rate</h2>
        <div className="flex shrink-0 items-center gap-2 text-[12px] text-ink-soft">
          <span className="block h-0 w-[16px] border-t border-dashed border-ink-mute" />
          Average {Math.round(avgRatePct)}%
        </div>
      </div>

      <div className="relative mt-4 h-[140px]">
        <div className="absolute inset-x-0 border-t border-line" style={{ top: POS_H }} />
        <div
          className="absolute inset-x-0 border-t border-dashed border-ink-mute/60"
          style={{ top: avgLineTop }}
        />
        <div className="absolute inset-0 flex items-stretch gap-2">
          {months.map((m, i) => {
            const clamped = Math.max(-scale, Math.min(scale, m.pct));
            const positive = clamped >= 0;
            const height = positive ? (clamped / scale) * POS_H : (Math.abs(clamped) / scale) * NEG_H;
            const labelTop = positive ? POS_H - height - 18 : POS_H + height + 4;
            const latest = i === months.length - 1;
            const fill = !positive ? 'var(--out)' : latest ? 'var(--indigo)' : 'rgb(var(--ink-rgb) / 0.2)';
            return (
              <div key={m.label} className="relative flex-1" title={`${m.label}: ${fmtEUR(m.net, { decimals: 0 })}`}>
                <div
                  className={'bar absolute left-[16%] right-[16%]' + (positive ? '' : ' bar-negative')}
                  style={{
                    bottom: positive ? BASE : BASE - height,
                    height,
                    borderRadius: positive ? '3px 3px 0 0' : '0 0 3px 3px',
                    background: fill,
                  }}
                />
                <div
                  className={
                    'absolute inline-block whitespace-nowrap text-[12px] tabular-nums ' +
                    (latest ? 'font-medium text-ink' : 'text-ink-mute')
                  }
                  style={{ top: labelTop, left: '50%', transform: 'translateX(-50%)' }}
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
          <div key={m.label} className="flex-1 text-center text-[12px] text-ink-mute">
            {m.label}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-end divide-y divide-[color:var(--line)] border-t border-line">
        {summaryRows.map((row) => (
          <div key={row.label} className="flex items-baseline gap-3 py-2">
            <span className="flex-1 truncate text-[13px] text-ink-soft">{row.label}</span>
            <span
              className="w-[52px] shrink-0 text-right text-[14px] tabular-nums"
              style={{ color: row.pct >= 0 ? 'var(--in)' : 'var(--out)' }}
            >
              {row.pct >= 0 ? '+' : '−'}
              {Math.abs(row.pct)}%
            </span>
            <span
              className="w-[84px] shrink-0 text-right text-[14px] font-medium tabular-nums"
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
