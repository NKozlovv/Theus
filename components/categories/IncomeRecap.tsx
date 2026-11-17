import { Button, Icon } from '@/components/ui';
import { categoryColor } from '@/lib/categoryColor';
import { fmtEUR } from '@/lib/money';
import type { CategorySummary } from '@/lib/categories/summary';

/**
 * Compact income recap below the expense table: a simple list (no
 * accordion or progress bars, since "over pace" doesn't apply to income).
 * "New income category" lives in this section's own header, next to its
 * title, in the same button style as the page header's "New category".
 */
export function IncomeRecap({
  summaries,
  onEdit,
  onAdd,
}: {
  summaries: CategorySummary[];
  onEdit: (categoryId: string) => void;
  onAdd: () => void;
}) {
  const total = summaries.reduce((s, x) => s + x.thisMonth, 0);
  const totalAvg = summaries.reduce((s, x) => s + x.avgMonthly, 0);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-[16px] font-medium text-ink">Income</h2>
          {summaries.length > 0 ? (
            <span className="text-[13px] tabular-nums text-ink-mute">
              {fmtEUR(total, { decimals: 0 })}
              {totalAvg > 0 ? ` · YTD avg ${fmtEUR(totalAvg, { decimals: 0 })}` : ''}
            </span>
          ) : null}
        </div>
        <Button onClick={onAdd}>
          <Icon name="plus" size={14} />
          New income category
        </Button>
      </div>

      <div className="glass p-2">
        {summaries.length === 0 ? (
          <div className="px-5 py-12 text-center text-[14px] text-ink-mute">No income categories yet</div>
        ) : (
          <>
            <div className="grid grid-cols-[32px_minmax(0,1.6fr)_110px_100px] gap-4 px-4 pb-2 pt-2 text-[12px] font-medium text-ink-mute">
              <span />
              <span>Category</span>
              <span>This month</span>
              <span>YTD avg / mo</span>
            </div>
            {summaries.map((s) => {
              const color = categoryColor(s.category.name);
              return (
                <div
                  key={s.category.id}
                  className="grid grid-cols-[32px_minmax(0,1.6fr)_110px_100px] items-center gap-4 rounded-[10px] px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => onEdit(s.category.id)}
                    aria-label={`Edit ${s.category.name}`}
                    title={`Edit ${s.category.name}`}
                    className="group/edit relative flex h-8 w-8 items-center justify-center rounded-[8px] text-[13px] font-medium text-ink"
                    style={{ background: `${color}26` }}
                  >
                    {s.category.name.charAt(0).toUpperCase()}
                    <span className="absolute inset-0 flex items-center justify-center rounded-[8px] bg-ink/70 text-white opacity-0 transition-opacity duration-150 group-hover/edit:opacity-100">
                      <Icon name="pencil" size={14} />
                    </span>
                  </button>
                  <span className="truncate text-[14px] font-medium text-ink">{s.category.name}</span>
                  <span className="text-[15px] font-medium tabular-nums text-in">
                    {fmtEUR(s.thisMonth, { decimals: 0 })}
                  </span>
                  <span className="text-[14px] tabular-nums text-ink-mute">
                    {fmtEUR(s.avgMonthly, { decimals: 0 })}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </section>
  );
}
