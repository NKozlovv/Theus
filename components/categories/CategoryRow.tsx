'use client';

import { Icon } from '@/components/ui';
import { categoryColor } from '@/lib/categoryColor';
import { fmtEUR } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { CategorySummary, SubcategorySummary } from '@/lib/categories/summary';

function paceColor(pctOfAvg: number): string {
  if (pctOfAvg > 115) return '#bf4040';
  if (pctOfAvg > 102) return '#a8650f';
  return '#1f7a52';
}

/**
 * Category row + its accordion panel. The whole row is the disclosure
 * trigger (opens the subcategory breakdown in place); the hue tile is a
 * separate click target that opens the rename/delete/subcategory-CRUD
 * modal (a pencil icon fades in on hover so that's discoverable), since a
 * 5-column row has no room for a dedicated edit affordance. The accordion
 * also repeats that entry point as an explicit "Add or remove
 * subcategories" link, since it's the one place users look for
 * subcategory management.
 */
export function CategoryRow({
  summary,
  open,
  onToggle,
  onEdit,
  subcategories,
}: {
  summary: CategorySummary;
  open: boolean;
  onToggle: () => void;
  onEdit: () => void;
  subcategories: SubcategorySummary[];
}) {
  const { category, thisMonth, avgMonthly } = summary;
  const color = categoryColor(category.name);
  const pctOfAvg = avgMonthly > 0 ? (thisMonth / avgMonthly) * 100 : 0;
  const meterPct = Math.min(100, (avgMonthly > 0 ? thisMonth / avgMonthly : 0) * 66);
  const tone = paceColor(pctOfAvg);

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onToggle();
        }}
        className="grid cursor-pointer grid-cols-[minmax(150px,1.1fr)_minmax(0,1.6fr)_110px_100px_32px] items-center gap-4 rounded-[10px] px-4 py-3 transition-colors duration-150 hover:bg-raised"
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label={`Edit ${category.name}`}
            title={`Edit ${category.name}`}
            className="group/edit relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-[13px] font-medium text-ink"
            style={{ background: `${color}26` }}
          >
            {category.name.charAt(0).toUpperCase()}
            <span className="absolute inset-0 flex items-center justify-center rounded-[8px] bg-ink/70 text-white opacity-0 transition-opacity duration-150 group-hover/edit:opacity-100">
              <Icon name="pencil" size={14} />
            </span>
          </button>
          <span className="truncate text-[14px] font-medium text-ink">{category.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative h-2 flex-1 rounded-[2px] bg-[color:var(--line)]">
            <div
              className="meter h-full rounded-[2px]"
              style={{ width: `${meterPct}%`, background: color }}
            />
            <span
              aria-hidden
              className="absolute -bottom-1 -top-1 w-px bg-ink/50"
              style={{ left: '66%' }}
            />
          </div>
          <span className="w-[48px] shrink-0 text-right text-[13px] font-medium tabular-nums" style={{ color: tone }}>
            {Math.round(pctOfAvg)}%
          </span>
        </div>

        <div className="text-[15px] font-medium tabular-nums text-ink">
          {fmtEUR(thisMonth, { decimals: 0 })}
        </div>

        <div className="text-[14px] tabular-nums text-ink-mute">{fmtEUR(avgMonthly, { decimals: 0 })}</div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-label={open ? 'Collapse' : 'Expand'}
          aria-expanded={open}
          className="flex h-8 w-8 items-center justify-center justify-self-end rounded-control text-ink-mute transition-colors hover:bg-surface hover:text-ink"
        >
          <Icon
            name="chevron-down"
            size={16}
            className={cn('transition-transform duration-150 ease-theus', open && 'rotate-180')}
          />
        </button>
      </div>

      {open ? (
        <div className="rise mb-2 ml-[60px] mr-2 mt-0.5 rounded-[10px] bg-raised px-4 py-3" style={{ animationDuration: '240ms' }}>
          {subcategories.length === 0 ? (
            <div className="py-2 text-[13px] text-ink-mute">No subcategories yet</div>
          ) : (
            <>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_90px_90px] gap-4 pb-2 text-[12px] font-medium text-ink-mute">
                <span />
                <span>Pace vs avg</span>
                <span>This month</span>
                <span>YTD avg / mo</span>
              </div>
              {subcategories.map((s) => {
                const subPctOfAvg = s.avgMonthly > 0 ? (s.thisMonth / s.avgMonthly) * 100 : 0;
                const subMeterPct = Math.min(100, (s.avgMonthly > 0 ? s.thisMonth / s.avgMonthly : 0) * 66);
                const subTone = paceColor(subPctOfAvg);
                return (
                  <div
                    key={s.subcategory.id}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_90px_90px] items-center gap-4 py-2 text-[14px]"
                  >
                    <span className="truncate text-ink-soft">{s.subcategory.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="relative h-1 flex-1 rounded-[2px] bg-[color:var(--line)]">
                        <div
                          className="meter h-full rounded-[2px]"
                          style={{ width: `${subMeterPct}%`, background: color }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right text-[12px] font-medium tabular-nums" style={{ color: subTone }}>
                        {Math.round(subPctOfAvg)}%
                      </span>
                    </div>
                    <span className="font-medium tabular-nums text-ink">{fmtEUR(s.thisMonth, { decimals: 0 })}</span>
                    <span className="tabular-nums text-ink-mute">{fmtEUR(s.avgMonthly, { decimals: 0 })}</span>
                  </div>
                );
              })}
            </>
          )}
          <div className="mt-1 border-t border-line pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-[13px] font-medium text-indigo transition-colors hover:text-indigo-dark"
            >
              Add or remove subcategories
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
