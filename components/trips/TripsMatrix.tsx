'use client';

import { subcategoryColor } from '@/lib/trips/subcategoryColor';
import { fmtEUR } from '@/lib/money';
import { averageMetric, formatMetric, metricValue, type TripMetric } from '@/lib/trips/view';
import type { TripSummary } from '@/lib/trips/summary';

function cellValue(t: TripSummary, subcategory: string, metric: TripMetric): number {
  const amount = t.bySubcategory.find((s) => s.name === subcategory)?.amount ?? 0;
  if (metric === 'total') return amount;
  if (metric === 'perDay') return amount / t.days;
  return amount / (t.days * t.travelers);
}

/**
 * Day-weighted average for one subcategory row: Σ spend ÷ Σ days (or
 * person-days), across only the trips that spent on it — not a mean of
 * each trip's own per-day rate. Matters because subcategories aren't all
 * the same shape: Hotels genuinely scales with nights, so a 20-night
 * trip's rate is backed by 20 nights of evidence and should count more
 * than a 2-night trip's; weighting by days gets that right. A per-trip,
 * unweighted mean (like averageMetric() in lib/trips/view.ts, used for
 * the trip-level average elsewhere on this page) answers a different
 * question — "what does a typical trip cost" — where treating every trip
 * as one vote is the point, not a shortcoming.
 */
function subcategoryAvg(trips: TripSummary[], subcategory: string, metric: TripMetric): number | null {
  const withAmount = trips
    .map((t) => ({ t, amount: t.bySubcategory.find((s) => s.name === subcategory)?.amount ?? 0 }))
    .filter((x) => x.amount > 0);
  if (withAmount.length === 0) return null;
  if (metric === 'total') {
    return withAmount.reduce((s, x) => s + x.amount, 0) / withAmount.length;
  }
  const totalAmount = withAmount.reduce((s, x) => s + x.amount, 0);
  const totalUnits = withAmount.reduce(
    (s, x) => s + (metric === 'perDay' ? x.t.days : x.t.days * x.t.travelers),
    0,
  );
  return totalUnits > 0 ? totalAmount / totalUnits : 0;
}

/** Subcategory × trip heat table — read across a row to compare one cost type over every trip. */
export function TripsMatrix({
  trips,
  metric,
  colors,
}: {
  trips: TripSummary[];
  metric: TripMetric;
  colors: Map<string, string>;
}) {
  const totals = new Map<string, number>();
  for (const t of trips) {
    for (const s of t.bySubcategory) totals.set(s.name, (totals.get(s.name) ?? 0) + s.amount);
  }
  const subcategories = Array.from(totals.keys()).sort((a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0));
  const avgSuffix = metric === 'total' ? '' : metric === 'perDay' ? '/day' : '/p·day';

  return (
    <section className="glass flex flex-col gap-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3.5">
        <div>
          <h2 className="text-[16px] font-medium text-ink">Subcategory by trip</h2>
          <div className="mt-1 text-[13px] text-ink-mute">
            {metric === 'total'
              ? 'Absolute spend per subcategory'
              : metric === 'perDay'
                ? 'Spend per subcategory, per day away'
                : 'Spend per subcategory, per person-day'}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-ink-soft">
          Lighter
          <span className="inline-block h-2 w-[88px] rounded-[2px] bg-[linear-gradient(90deg,rgba(47,69,184,.06),rgba(47,69,184,.5))]" />
          heavier, read across each row
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="px-2 py-1.5 text-left text-[12px] font-medium text-ink-mute">
                Subcategory
              </th>
              {trips.map((t) => (
                <th key={t.trip} className="whitespace-nowrap px-2 py-1.5 text-right text-[13px] font-medium text-ink">
                  {t.trip}
                  <div className="text-[12px] font-normal text-ink-mute">
                    {t.days}d · {t.travelers}p
                  </div>
                </th>
              ))}
              <th
                className="whitespace-nowrap px-2 py-1.5 text-right text-[12px] font-medium text-ink"
                title="Day-weighted average across trips that actually spent on this subcategory (Σ spend ÷ Σ days) — changes with the metric above."
              >
                {`Avg${avgSuffix}`}
              </th>
              <th
                className="whitespace-nowrap px-2 py-1.5 text-right text-[12px] font-medium text-ink"
                title="Absolute total across every trip — always the raw sum, regardless of which metric is selected."
              >
                Sum (€)
              </th>
            </tr>
          </thead>
          <tbody>
            {subcategories.map((sub) => {
              const values = trips.map((t) => cellValue(t, sub, metric));
              const cmax = Math.max(...values, 0) || 1;
              const avg = subcategoryAvg(trips, sub, metric);
              const sum = totals.get(sub) ?? 0;
              return (
                <tr key={sub}>
                  <td className="whitespace-nowrap rounded-[8px] bg-raised px-3 py-2">
                    <span
                      className="mr-2 inline-block h-2 w-2 rounded-[2px]"
                      style={{ background: subcategoryColor(colors, sub) }}
                    />
                    <span className="text-[13px] font-medium text-ink">{sub}</span>
                  </td>
                  {trips.map((t, i) => {
                    const v = values[i]!;
                    const r = v / cmax;
                    return (
                      <td
                        key={t.trip}
                        className="rounded-[8px] px-3 py-2 text-right text-[13px] tabular-nums"
                        style={{
                          // Tint capped at .5 so ink text keeps 4.5:1 on the darkest cell.
                          background: v === 0 ? 'transparent' : `rgba(47, 69, 184, ${(0.06 + r * 0.44).toFixed(3)})`,
                          color: v === 0 ? 'var(--ink-mute)' : 'var(--ink)',
                        }}
                      >
                        {v === 0 ? '—' : fmtEUR(metric === 'total' ? v : Math.round(v), { decimals: 0 })}
                      </td>
                    );
                  })}
                  <td className="whitespace-nowrap rounded-[8px] bg-raised px-3 py-2 text-right text-[13px] tabular-nums text-ink">
                    {avg === null ? '—' : fmtEUR(metric === 'total' ? avg : Math.round(avg), { decimals: 0 })}
                  </td>
                  <td className="whitespace-nowrap rounded-[8px] bg-raised px-3 py-2 text-right text-[13px] font-medium tabular-nums text-ink">
                    {fmtEUR(sum, { decimals: 0 })}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td className="px-3 py-2 text-[13px] font-medium text-ink">
                Trip total
              </td>
              {trips.map((t) => (
                <td key={t.trip} className="double-rule px-3 py-2 text-right text-[14px] font-medium tabular-nums text-ink">
                  {formatMetric(metricValue(t, metric), metric)}
                </td>
              ))}
              <td className="double-rule px-3 py-2 text-right text-[14px] font-medium tabular-nums text-ink">
                {formatMetric(averageMetric(trips, metric), metric)}
              </td>
              <td className="double-rule px-3 py-2 text-right text-[14px] font-medium tabular-nums text-ink">
                {fmtEUR(
                  trips.reduce((s, t) => s + t.total, 0),
                  { decimals: 0 },
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
