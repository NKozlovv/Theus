'use client';

import { fmtEUR } from '@/lib/money';
import { averageMetric, formatMetric, metricValue, type TripMetric } from '@/lib/trips/view';
import type { TripSummary } from '@/lib/trips/summary';

/**
 * Newest trip first (not sorted by value — a ranking that's "always split
 * down the middle" around the average line doesn't tell you much more than
 * the bar lengths already do; date order at least reads as a timeline).
 * Bar length still reflects the active metric; a single uniform color
 * keeps the focus on length rather than an above/below-average color that
 * mostly just repeats what the ordering used to show.
 */
export function TripsRanked({ trips, metric }: { trips: TripSummary[]; metric: TripMetric }) {
  const byDate = [...trips].sort((a, b) => (a.fromDate < b.fromDate ? 1 : a.fromDate > b.fromDate ? -1 : 0));
  const max = Math.max(...trips.map((t) => metricValue(t, metric)), 1);
  const avg = averageMetric(trips, metric);
  const avgPct = Math.min(100, (avg / max) * 100);
  const maxValue = Math.max(...trips.map((t) => metricValue(t, metric)));

  return (
    <section className="glass flex flex-col gap-5 p-6">
      <div>
        <h2 className="text-[16px] font-medium text-ink">Trips ranked</h2>
        <div className="mt-1 text-[13px] text-ink-mute">Most recent trip first</div>
      </div>

      <div className="flex flex-col gap-3">
        {byDate.map((t) => {
          const value = metricValue(t, metric);
          const barPct = Math.min(100, (value / max) * 100);
          const fixedPct = t.total > 0 ? Math.round((t.fixed / t.total) * 100) : 0;

          return (
            <div
              key={t.trip}
              className="rounded-[10px] px-3 py-2.5 transition-colors duration-150 ease-theus hover:bg-raised"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="truncate text-[14px] font-medium text-ink">{t.trip}</span>
                  <span className="whitespace-nowrap text-[12px] text-ink-mute">
                    {t.days}d · {t.travelers} {t.travelers > 1 ? 'people' : 'person'}
                  </span>
                </div>
                <span className="whitespace-nowrap text-[15px] font-medium tabular-nums text-ink">
                  {formatMetric(value, metric)}
                </span>
              </div>
              <div className="relative mt-2 h-2 rounded-[2px] bg-[color:var(--line)]">
                <div
                  className={
                    'meter absolute inset-y-0 left-0 origin-left rounded-[2px] ' +
                    (value === maxValue ? 'bg-indigo' : 'bg-ink/30')
                  }
                  style={{ width: `${barPct}%` }}
                />
                <div
                  className="absolute -bottom-1 -top-1 w-px bg-ink/50"
                  style={{ left: `${avgPct}%` }}
                  aria-hidden
                />
              </div>
              <div className="mt-1.5 text-[12px] tabular-nums text-ink-soft">
                {fmtEUR(t.total, { decimals: 0 })} total · {fixedPct}% fixed ·{' '}
                {fmtEUR(Math.round(t.dailyPerDay), { decimals: 0 })}/day
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-[12px] text-ink-soft">
        <span className="inline-block h-3 w-px bg-ink/50" aria-hidden />
        Average across all trips · {formatMetric(avg, metric)}
      </div>
    </section>
  );
}
