'use client';

import { Icon } from '@/components/ui';
import { fmtEUR } from '@/lib/money';
import { BudgetRing } from './BudgetRing';
import { GLOBAL_ADD_TRANSACTION_EVENT } from '@/components/transactions/GlobalAddTransactionModal';

function splitFigure(n: number): { sign: string; whole: string; cents: string } {
  const sign = n < 0 ? '−' : '';
  const [whole, cents] = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).split('.');
  return { sign, whole: whole ?? '0', cents: cents ?? '00' };
}

/**
 * The Balance panel — left cell of the Overview hero row. The closest panel
 * to the viewer (`glass-hero`): label, delta chip, the huge balance figure
 * and the page action, over a ring + two projection tiles.
 *
 * Spacing is on one scale: 24 panel padding and gap, 16 inside the lower
 * row. Radii come from the tokens (32 panel, 20 ring card, 16 tiles).
 */
export function BalancePanel({
  accountCount,
  totalBalance,
  monthDelta,
  monthPct,
  vsMonthLabel,
  spentThisMonth,
  incomeThisMonth,
  monthLabel,
  avgSavingsRate,
  projectedEOY,
  avgNet,
  savingsThisYear,
  savingsIncome,
  savingsExpense,
}: {
  accountCount: number;
  totalBalance: number;
  monthDelta: number;
  monthPct: number;
  vsMonthLabel: string;
  spentThisMonth: number;
  incomeThisMonth: number;
  monthLabel: string;
  avgSavingsRate: number;
  projectedEOY: number;
  avgNet: number;
  savingsThisYear: number;
  savingsIncome: number;
  savingsExpense: number;
}) {
  const figure = splitFigure(totalBalance);
  const down = monthDelta < 0;
  const avgRatePct = Math.round(avgSavingsRate * 100);

  return (
    <div className="glass glass-hero flex flex-col gap-6 p-6">
      {/* Row 1 — headline */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-[240px] flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="t-label">
              Total balance · {accountCount} account{accountCount === 1 ? '' : 's'}
            </span>
            <span
              className={
                'inline-flex items-center rounded-full px-3 py-1 text-[12px] font-bold tabular-nums ' +
                (down ? 'bg-coral/[0.16] text-out' : 'bg-teal/[0.16] text-in')
              }
            >
              {down ? '↓' : '↑'} {Math.abs(monthPct).toFixed(1)}% · {fmtEUR(monthDelta, { decimals: 0 })} vs{' '}
              {vsMonthLabel}
            </span>
          </div>
          <div className="mt-3 flex flex-nowrap items-baseline gap-1 whitespace-nowrap">
            <span className="text-[clamp(24px,2.2vw,32px)] font-bold text-ink-mute">{figure.sign}€</span>
            <span className="text-[clamp(44px,5.4vw,78px)] font-extrabold -tracking-[0.04em] tabular-nums text-ink">
              {figure.whole}
            </span>
            <span className="text-[clamp(26px,2.4vw,36px)] font-bold tabular-nums text-ink-mute">.{figure.cents}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent(GLOBAL_ADD_TRANSACTION_EVENT))}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-indigo py-2 pl-4 pr-2 text-[14px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(31,39,66,0.5),inset_0_1px_0_rgba(255,255,255,0.28)] transition-colors duration-200 ease-theus hover:bg-indigo-dark"
        >
          Add transaction
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.22]">
            <Icon name="arrow-right" size={14} strokeWidth={2.2} />
          </span>
        </button>
      </div>

      {/* Row 2 — ring + figures */}
      <div className="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-4 min-[720px]:grid-cols-[minmax(184px,0.95fr)_minmax(0,1.35fr)]">
        <BudgetRing
          spent={spentThisMonth}
          income={incomeThisMonth}
          avgSavingsRate={avgSavingsRate}
          monthLabel={monthLabel}
        />

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(168px,100%),1fr))] items-stretch gap-4">
          <div className="glass-tile flex min-h-[96px] flex-col justify-between gap-2 p-4 transition-colors duration-150 hover:!bg-white/[0.85]">
            <div className="t-label">Projected 31 Dec</div>
            <div className="text-[clamp(24px,2.2vw,30px)] font-extrabold -tracking-[0.02em] tabular-nums text-in">
              {fmtEUR(projectedEOY, { decimals: 0 })}
            </div>
            <div className="text-[12px] font-medium text-ink-mute">
              <span className="whitespace-nowrap">at {avgRatePct}% rate</span> ·{' '}
              <span className="whitespace-nowrap">
                {avgNet >= 0 ? '+' : '−'}
                {fmtEUR(Math.abs(avgNet), { decimals: 0 })}/mo
              </span>
            </div>
          </div>
          <div className="glass-tile flex min-h-[96px] flex-col justify-between gap-2 p-4 transition-colors duration-150 hover:!bg-white/[0.85]">
            <div className="t-label">Net this year</div>
            <div
              className={
                'text-[clamp(24px,2.2vw,30px)] font-extrabold -tracking-[0.02em] tabular-nums ' +
                (savingsThisYear >= 0 ? 'text-in' : 'text-out')
              }
            >
              {savingsThisYear >= 0 ? '+' : ''}
              {fmtEUR(savingsThisYear, { decimals: 0 })}
            </div>
            <div className="text-[12px] font-medium text-ink-mute">
              <span className="whitespace-nowrap">in {fmtEUR(savingsIncome, { decimals: 0 })}</span> ·{' '}
              <span className="whitespace-nowrap">out {fmtEUR(savingsExpense, { decimals: 0 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
