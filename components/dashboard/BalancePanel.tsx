'use client';

import { Button, Icon } from '@/components/ui';
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
 * The Balance panel — left cell of the Overview's first row. The one
 * bright element of the screen: the total balance set large, with the
 * accountant's double rule under it. Below, the month's spend ring and
 * two projection tiles stay quiet.
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
    <div className="glass flex flex-col gap-6 p-6">
      {/* Row 1 — headline */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-[240px] flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-soft">
            <span>
              Total balance · {accountCount} account{accountCount === 1 ? '' : 's'}
            </span>
            <span className={'inline-flex items-center gap-1 tabular-nums ' + (down ? 'text-out' : 'text-in')}>
              <Icon name={down ? 'arrow-down' : 'arrow-up'} size={14} />
              {Math.abs(monthPct).toFixed(1)}% · {fmtEUR(monthDelta, { decimals: 0 })} vs {vsMonthLabel}
            </span>
          </div>
          <div className="double-rule mt-3 inline-flex flex-nowrap items-baseline gap-1 whitespace-nowrap">
            <span className="text-[clamp(24px,2.2vw,32px)] font-normal text-ink-mute">{figure.sign}€</span>
            <span className="text-[clamp(44px,5.4vw,72px)] font-medium leading-none tracking-[-0.03em] tabular-nums text-ink">
              {figure.whole}
            </span>
            <span className="text-[clamp(24px,2.4vw,32px)] font-normal tabular-nums text-ink-mute">
              .{figure.cents}
            </span>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 flex-nowrap items-center gap-2">
          <Button onClick={() => window.dispatchEvent(new CustomEvent(GLOBAL_ADD_TRANSACTION_EVENT))}>
            Add transaction
            <Icon name="arrow-right" size={14} />
          </Button>
        </div>
      </div>

      {/* Row 2 — ring + figures */}
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(180px,0.95fr)_minmax(0,1.35fr)] items-stretch gap-4">
        <BudgetRing
          spent={spentThisMonth}
          income={incomeThisMonth}
          avgSavingsRate={avgSavingsRate}
          monthLabel={monthLabel}
        />

        <div className="grid grid-cols-[repeat(auto-fit,minmax(168px,1fr))] items-stretch gap-4">
          <div className="glass-tile flex min-h-[80px] flex-col justify-between gap-2 p-4">
            <div className="text-[12px] text-ink-mute">Projected 31 Dec</div>
            <div className="text-[clamp(24px,2.2vw,28px)] font-medium leading-none tabular-nums text-ink">
              {fmtEUR(projectedEOY, { decimals: 0 })}
            </div>
            <div className="text-[12px] text-ink-mute">
              <span className="whitespace-nowrap">at {avgRatePct}% savings rate</span>
              {' · '}
              <span className="whitespace-nowrap">
                {avgNet >= 0 ? '+' : '−'}
                {fmtEUR(Math.abs(avgNet), { decimals: 0 })}/mo
              </span>
            </div>
          </div>
          <div className="glass-tile flex min-h-[80px] flex-col justify-between gap-2 p-4">
            <div className="text-[12px] text-ink-mute">Net this year</div>
            <div
              className={
                'text-[clamp(24px,2.2vw,28px)] font-medium leading-none tabular-nums ' +
                (savingsThisYear >= 0 ? 'text-in' : 'text-out')
              }
            >
              {savingsThisYear >= 0 ? '+' : ''}
              {fmtEUR(savingsThisYear, { decimals: 0 })}
            </div>
            <div className="text-[12px] text-ink-mute">
              <span className="whitespace-nowrap">in {fmtEUR(savingsIncome, { decimals: 0 })}</span>
              {' · '}
              <span className="whitespace-nowrap">out {fmtEUR(savingsExpense, { decimals: 0 })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
