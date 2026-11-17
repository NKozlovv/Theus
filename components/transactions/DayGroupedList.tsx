'use client';

import { Icon } from '@/components/ui';
import { categoryColor } from '@/lib/categoryColor';
import { fmtCurrency, fmtEUR, signedAmount, txToEUR } from '@/lib/money';
import { groupTransactionsByDate } from '@/lib/transactions/grouping';
import { isUncategorised } from '@/lib/transactions/constants';
import { cn } from '@/lib/utils';
import type { Account, Transaction } from '@/lib/supabase/types';

/**
 * Day-grouped transaction list. Seven columns: checkbox, category-hue
 * avatar, name+note, category, subcategory (its own column so the
 * hierarchy stays distinct from the category), account, amount. The whole
 * row (not just one cell) opens the edit modal; the checkbox alone toggles
 * selection. Rows share one height; money in is the only colored amount.
 */
export function DayGroupedList({
  transactions,
  accounts,
  budgetFxRate,
  selectedIds,
  onToggleSelect,
  onEdit,
  now,
}: {
  transactions: Transaction[];
  accounts: Account[];
  budgetFxRate: number;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (tx: Transaction) => void;
  now: Date;
}) {
  const accById = new Map(accounts.map((a) => [a.id, a]));
  const groups = groupTransactionsByDate(transactions, budgetFxRate, now);

  return (
    <div className="glass p-2">
      {groups.map((group) => (
        <div key={group.date}>
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <span className="text-[13px] font-medium text-ink-soft">{group.label}</span>
            <span className="text-[13px] tabular-nums text-ink-mute">
              {group.totalEUR >= 0 ? '+' : '−'}
              {fmtEUR(Math.abs(group.totalEUR))}
            </span>
          </div>

          {group.items.map((tx) => {
            const acc = tx.account_id ? accById.get(tx.account_id) : undefined;
            const catName = isUncategorised(tx.category) ? '' : (tx.category ?? '').trim();
            const isInflow = tx.type === 'income';
            const hue = categoryColor(catName || (isInflow ? 'Income' : ''));
            const avatarLabel = catName || (isInflow ? 'Income' : '');
            const initial = avatarLabel ? avatarLabel.charAt(0).toUpperCase() : '—';
            const isSelected = selectedIds.has(tx.id);
            const amountColor = isInflow ? 'var(--in)' : 'var(--ink)';
            const showEurLine = tx.currency !== 'EUR';
            const signedEur = signedAmount({ type: tx.type, amount: txToEUR(tx, budgetFxRate) });

            return (
              <div
                key={tx.id}
                role="button"
                tabIndex={0}
                onClick={() => onEdit(tx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onEdit(tx);
                }}
                className={cn(
                  'grid cursor-pointer items-center gap-4 rounded-[10px] px-4 py-3 transition-colors duration-150',
                  'grid-cols-[20px_32px_minmax(130px,1.5fr)_minmax(0,1fr)_minmax(0,.9fr)_minmax(0,.85fr)_auto]',
                  isSelected ? 'bg-raised' : 'hover:bg-raised',
                )}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-label={isSelected ? 'Deselect transaction' : 'Select transaction'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(tx.id);
                  }}
                  className="group/check -m-[9px] flex shrink-0 items-center justify-center p-[9px]"
                >
                  <span
                    className={cn(
                      'flex h-[16px] w-[16px] items-center justify-center rounded-[4px] border-[1.5px] transition-colors',
                      isSelected
                        ? 'border-indigo bg-indigo'
                        : 'border-[color:var(--line-strong)] bg-surface group-hover/check:border-indigo',
                    )}
                  >
                    {isSelected ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    ) : null}
                  </span>
                </button>

                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-[13px] font-medium text-ink"
                  style={{ background: `${hue}26` }}
                >
                  {initial}
                </span>

                <span className="flex min-w-0 flex-col items-start">
                  <span className="w-full truncate text-[14px] font-medium text-ink">
                    {tx.comment?.trim() || catName || 'No description'}
                  </span>
                  <span className="w-full truncate text-[12px] text-ink-mute">
                    {tx.comment?.trim() && catName ? catName : ' '}
                  </span>
                </span>

                <span className="flex min-w-0 flex-col items-start gap-1">
                  {catName ? (
                    <span className="flex max-w-full items-center gap-2 truncate text-[13px] text-ink">
                      <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ background: hue }} />
                      <span className="truncate">{catName}</span>
                    </span>
                  ) : (
                    <span className="text-[13px] text-ink-mute">—</span>
                  )}
                  {tx.trip ? (
                    <span className="flex max-w-full items-center gap-1 truncate text-[12px] text-ink-mute">
                      <Icon name="plane" size={12} className="shrink-0" />
                      <span className="truncate">{tx.trip}</span>
                    </span>
                  ) : null}
                </span>

                <span className="flex min-w-0 items-center gap-2">
                  {tx.subcategory ? (
                    <span className="truncate text-[13px] text-ink-soft">{tx.subcategory}</span>
                  ) : (
                    <span className="text-[13px] text-ink-mute">—</span>
                  )}
                </span>

                <span className="truncate text-[13px] text-ink-mute">{acc ? acc.name : '—'}</span>

                <span className="flex min-w-[110px] flex-col items-end">
                  <span className="text-[15px] font-medium tabular-nums" style={{ color: amountColor }}>
                    {isInflow ? '+' : '−'}
                    {fmtCurrency(Math.abs(tx.amount), tx.currency)}
                  </span>
                  {showEurLine ? (
                    <span className="text-[12px] tabular-nums text-ink-mute">
                      ≈ {fmtEUR(signedEur)}
                    </span>
                  ) : null}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
