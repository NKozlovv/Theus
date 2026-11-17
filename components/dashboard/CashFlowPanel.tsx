'use client';

import { fmtEUR } from '@/lib/money';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { useChartHover } from '@/components/charts/useChartHover';

export interface CashFlowMonth {
  label: string;
  income: number;
  expense: number;
  projected: boolean;
}

const INCOME_INK = '#2f45b8';
const SPEND_INK = '#4a4a4a';

const kFmt = (n: number) => (n === 0 ? '0' : `${(n / 1000).toFixed(1)}k`);
/** Reserved for the month-label row below the bars — matches its rendered height. */
const LABEL_H = 24;

/**
 * Cash flow panel — the main chart of the Overview and the widest block on
 * it. Twelve months (real + YTD-average-projected) with a y-axis instead of
 * per-bar labels: with 12 columns there isn't room for two always-on
 * figures per column, so the axis carries the scale and a tooltip carries
 * the exact numbers on hover.
 *
 * Two series, two inks: income in the accent, spending in graphite.
 * Projected months are the same colors drawn as dashed outlines.
 *
 * The chart fills whatever height the grid row stretches this panel to
 * (percentage-height bars, not a fixed pixel plot).
 */
export function CashFlowPanel({
  months,
  ytdIncome,
  ytdExpense,
  ytdNet,
  year,
}: {
  months: CashFlowMonth[];
  ytdIncome: number;
  ytdExpense: number;
  ytdNet: number;
  year: number;
}) {
  const max = Math.max(1, ...months.flatMap((m) => [m.income, m.expense]));
  const ticks = [max, (max * 2) / 3, max / 3, 0];
  const { containerRef, hover, show, hide } = useChartHover<CashFlowMonth>();

  return (
    <div className="glass flex h-full flex-col p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-medium text-ink">Cash flow</h2>
          <div className="mt-1 text-[13px] text-ink-mute">
            YTD in {fmtEUR(ytdIncome, { decimals: 0 })} · out {fmtEUR(ytdExpense, { decimals: 0 })} · net{' '}
            {ytdNet >= 0 ? '+' : ''}
            {fmtEUR(ytdNet, { decimals: 0 })} · {year} projected
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <LegendSwatch color={INCOME_INK}>Income</LegendSwatch>
          <LegendSwatch color={SPEND_INK}>Spending</LegendSwatch>
          <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-soft">
            <span className="h-[10px] w-[10px] rounded-[2px] border border-dashed border-ink-mute" />
            Projected
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative mt-6 flex min-h-0 flex-1 items-stretch gap-2"
        style={{ minHeight: 200 + LABEL_H }}
      >
        <div
          className="flex flex-none flex-col justify-between text-right text-[12px] tabular-nums text-ink-mute"
          style={{ paddingBottom: LABEL_H }}
        >
          {ticks.map((t, i) => (
            <span key={i}>{kFmt(t)}</span>
          ))}
        </div>

        <div className="relative flex flex-1 items-stretch gap-1">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between"
            style={{ bottom: LABEL_H }}
          >
            {ticks.map((_, i) => (
              <span key={i} className="block h-px w-full bg-[color:var(--line)]" />
            ))}
          </div>

          {months.map((m, i) => {
            const incomePct = (m.income / max) * 100;
            const expensePct = (m.expense / max) * 100;
            return (
              <div
                key={i}
                className="relative flex flex-1 flex-col items-center gap-1.5 rounded-[6px] transition-colors duration-150 hover:bg-raised"
                onMouseEnter={(e) => show(e, m)}
                onMouseMove={(e) => show(e, m)}
                onMouseLeave={hide}
              >
                <div className="flex w-full flex-1 items-end gap-[3px] px-0.5">
                  <div
                    className="bar w-[46%] rounded-[3px_3px_0_0]"
                    style={{
                      height: `${incomePct}%`,
                      background: m.projected ? 'rgba(47,69,184,.08)' : INCOME_INK,
                      border: m.projected ? `1px dashed ${INCOME_INK}` : undefined,
                      boxSizing: 'border-box',
                    }}
                  />
                  <div
                    className="bar w-[46%] rounded-[3px_3px_0_0]"
                    style={{
                      height: `${expensePct}%`,
                      background: m.projected ? 'rgba(74,74,74,.08)' : SPEND_INK,
                      border: m.projected ? `1px dashed ${SPEND_INK}` : undefined,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div
                  className="text-[12px]"
                  style={{ color: m.projected ? 'rgb(var(--ink-mute-rgb) / .6)' : 'var(--ink-mute)' }}
                >
                  {m.label}
                </div>
              </div>
            );
          })}
        </div>

        {hover ? (
          <ChartTooltip x={hover.x} y={hover.y} containerWidth={hover.containerWidth}>
            <span className="font-medium text-ink">{hover.data.label}</span>
            {hover.data.projected ? <span className="ml-1 text-ink-mute">(projected)</span> : null}
            <br />
            <span style={{ color: 'var(--in)' }}>in {fmtEUR(hover.data.income, { decimals: 0 })}</span>
            <span className="mx-1 text-ink-mute">·</span>
            <span style={{ color: 'var(--out)' }}>out {fmtEUR(hover.data.expense, { decimals: 0 })}</span>
            <span className="mx-1 text-ink-mute">·</span>
            <span className="text-ink">net {fmtEUR(hover.data.income - hover.data.expense, { decimals: 0 })}</span>
          </ChartTooltip>
        ) : null}
      </div>
    </div>
  );
}

function LegendSwatch({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-soft">
      <span className="h-[10px] w-[10px] rounded-[2px]" style={{ background: color }} />
      {children}
    </span>
  );
}
