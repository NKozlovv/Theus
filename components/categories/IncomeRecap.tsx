import { Button, Icon } from '@/components/ui';
import { categoryColor } from '@/lib/categoryColor';
import { fmtEUR } from '@/lib/money';
import type { CategorySummary } from '@/lib/categories/summary';

/**
 * Compact income recap below the expense table. The design doesn't show
 * income at all — this app's schema tracks it, so it stays as a simple
 * restyled list (no accordion/progress-bar semantics, since "over pace"
 * doesn't apply to income). "+ New income category" lives in this
 * section's own header, next to its title, as the same button style as
 * the expense table's "+ New category" — mirroring where it sits (via
 * the page header) and matching how it looks, rather than floating below
 * both tables as a lighter-weight text link.
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
          <span className="text-[15px] font-bold text-ink">Income</span>
          {summaries.length > 0 ? (
            <span className="text-[13px] font-semibold text-ink-mute">
              {fmtEUR(total, { decimals: 0 })}
              {totalAvg > 0 ? ` · YTD avg ${fmtEUR(totalAvg, { decimals: 0 })}` : ''}
            </span>
          ) : null}
        </div>
        <Button onClick={onAdd}>
          <Icon name="plus" size={13} />
          New income category
        </Button>
      </div>

      <div className="glass p-3">
        {summaries.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-ink-mute">No income categories yet.</div>
        ) : (
          <>
            <div className="grid grid-cols-[34px_minmax(0,1.6fr)_110px_100px] gap-4 px-4 pb-1.5 pt-1 text-ink-mute t-label">
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
                  className="grid grid-cols-[34px_minmax(0,1.6fr)_110px_100px] items-center gap-4 rounded-[16px] px-4 py-4"
                >
                  <button
                    type="button"
                    onClick={() => onEdit(s.category.id)}
                    aria-label={`Edit ${s.category.name}`}
                    title={`Edit ${s.category.name}`}
                    className="group/edit relative flex h-[34px] w-[34px] items-center justify-center rounded-[12px] text-[13px] font-bold text-white transition-transform "
                    style={{ background: color }}
                  >
                    {s.category.name.charAt(0).toUpperCase()}
                    <span className="absolute inset-0 flex items-center justify-center rounded-[12px] bg-black/40 opacity-0 transition-opacity group-hover/edit:opacity-100">
                      <Icon name="pencil" size={14} />
                    </span>
                  </button>
                  <span className="truncate text-[14px] font-semibold text-ink">{s.category.name}</span>
                  <span className="text-[16px] font-bold tabular-nums text-in">
                    {fmtEUR(s.thisMonth, { decimals: 0 })}
                  </span>
                  <span className="text-[14px] font-semibold text-ink-mute">
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
