'use client';

import { cn } from '@/lib/utils';
import { TRIP_METRICS, type TripMetric } from '@/lib/trips/view';

/**
 * The metric picker, pulled out of TripsHero — the metric it controls
 * affects sections well below the fold (ranked list, mix chart, matrix,
 * table), so it needs to stay reachable while scrolled down instead of
 * requiring a trip back to the hero.
 *
 * Sticky needs every ancestor to have `overflow: visible` (CLAUDE.md §8h),
 * so keep it that way on the app shell. The offset clears the 56px top bar
 * plus 16px of air.
 */
export function CompareByBar({
  metric,
  onMetricChange,
}: {
  metric: TripMetric;
  onMetricChange: (metric: TripMetric) => void;
}) {
  return (
    <div className="sticky top-[72px] z-10 flex justify-center">
      <div className="flex items-center gap-3 rounded-[12px] border border-line bg-surface py-1 pl-4 pr-1">
        <span className="whitespace-nowrap text-[13px] text-ink-mute">Compare by</span>
        <div className="flex gap-1 rounded-control bg-raised p-1">
          {TRIP_METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => onMetricChange(m.key)}
              className={cn(
                'whitespace-nowrap rounded-[8px] px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ease-theus',
                m.key === metric ? 'bg-indigo text-white' : 'text-ink-soft hover:bg-surface hover:text-ink',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
