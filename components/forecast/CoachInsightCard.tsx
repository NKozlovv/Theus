import { Icon } from '@/components/ui';
import { fmtEUR } from '@/lib/money';
import { milestoneEta, nextMilestone } from '@/lib/forecast/projection';
import { monthName } from '@/lib/date';

/**
 * "Next milestone" card — Theus Forecast design handoff. Computes a
 * savings-rate-based milestone projection from real transaction data; the
 * "set your own goal" action is intentionally absent — goal infrastructure
 * doesn't exist yet.
 */
export function CoachInsightCard({
  balanceNow,
  avgNet,
  savingsRate,
  now,
}: {
  balanceNow: number;
  avgNet: number;
  savingsRate: number; // 0..1
  now: Date;
}) {
  const milestone = nextMilestone(balanceNow);
  const eta = milestoneEta({ balance: balanceNow, avgNet, milestone, now });

  return (
    <div className="flex items-start gap-4 rounded-[20px] border border-white/60 bg-[linear-gradient(140deg,rgba(74,92,224,.16),rgba(31,185,164,.14))] p-5 px-6 [box-shadow:inset_0_1.5px_0_rgba(255,255,255,.9)]">
      <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,#6b7bf0,#4a5ce0)]">
        <Icon name="sparkle" size={19} color="#fff" strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <div className="text-indigo-dark t-label">Next milestone</div>
        {avgNet <= 0 || !eta ? (
          <p className="mt-2 text-[17px] font-bold leading-[1.4] text-ink">
            Your YTD pace is breaking even or trending down. Once you log a few months of
            net-positive activity, milestones will show up here.
          </p>
        ) : (
          <p className="mt-2 text-[17px] font-bold leading-[1.4] text-ink">
            If you keep your savings rate of {Math.round(savingsRate * 100)}%, you&apos;ll reach{' '}
            {fmtEUR(milestone, { decimals: 0 })} by {monthName(eta.date.getMonth())} {eta.date.getFullYear()} —
            about {eta.months} {eta.months === 1 ? 'month' : 'months'} from now.
          </p>
        )}
        <p className="mt-2 text-[13px] font-semibold leading-relaxed text-ink-soft">
          Computed from your own numbers, not a prediction. Setting a target of your own isn&apos;t
          built yet.
        </p>
      </div>
    </div>
  );
}
