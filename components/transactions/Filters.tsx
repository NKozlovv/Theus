'use client';

import { useState } from 'react';
import { FilterPill, Icon, OptionsList, useDismissable, type DropdownOption } from '@/components/ui';
import { UNCATEGORISED } from '@/lib/transactions/constants';
import { cn } from '@/lib/utils';
import type { Account, Category, Subcategory, TxType } from '@/lib/supabase/types';

export interface TxFilterValue {
  type: 'All' | TxType;
  account: string;
  category: string;
  subcategory: string;
  month: string;
  search: string;
}

export function emptyTxFilters(): TxFilterValue {
  return { type: 'All', account: 'All', category: 'All', subcategory: 'All', month: 'All', search: '' };
}

const TYPE_PILLS: Array<{ value: TxType; label: string }> = [
  { value: 'expense', label: 'Expenses' },
  { value: 'income', label: 'Income' },
  { value: 'adjustment', label: 'Adjustments' },
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split('-');
  const idx = Number(m) - 1;
  if (!y || idx < 0 || idx > 11) return yyyymm;
  return `${MONTH_NAMES[idx]} ${y}`;
}

/**
 * Filter row: type chips, a Month filter (at 1000+ transactions it is
 * genuinely needed), and Category/Subcategory/Account/Month dropdowns that
 * use the themed `OptionsList` popover instead of native `<select>`
 * elements. Type chips stay single-select; "Clear" appears once anything is
 * engaged; the search box and the live count sit to the right.
 */
export function Filters({
  accounts,
  expenseCats,
  incomeCats,
  subcategories,
  months,
  value,
  onChange,
  shown,
  total,
}: {
  accounts: Account[];
  expenseCats: Category[];
  incomeCats: Category[];
  subcategories: Subcategory[];
  /** Distinct 'YYYY-MM' strings present in the data, newest first. */
  months: string[];
  value: TxFilterValue;
  onChange: (next: TxFilterValue) => void;
  /** Filtered count / unfiltered total — "Showing N of 412", recomputed from the filtered set. */
  shown: number;
  total: number;
}) {
  function patch(updates: Partial<TxFilterValue>) {
    onChange({ ...value, ...updates });
  }

  const allCats = [...expenseCats, ...incomeCats].sort((a, b) => a.name.localeCompare(b.name));

  const subcatScope = (() => {
    if (value.category === 'All' || value.category === UNCATEGORISED) return subcategories;
    const cat = allCats.find((c) => c.name === value.category);
    return cat ? subcategories.filter((s) => s.category_id === cat.id) : [];
  })();

  const hasAnyFilter =
    value.type !== 'All' ||
    value.account !== 'All' ||
    value.category !== 'All' ||
    value.subcategory !== 'All' ||
    value.month !== 'All' ||
    value.search.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterPill active={value.type === 'All'} onClick={() => patch({ type: 'All' })}>
        All
      </FilterPill>
      {TYPE_PILLS.map((p) => (
        <FilterPill key={p.value} active={value.type === p.value} onClick={() => patch({ type: p.value })}>
          {p.label}
        </FilterPill>
      ))}

      <CapsuleSelect
        value={value.category}
        onChange={(v) => patch({ category: v, subcategory: 'All' })}
        options={[
          { value: 'All', label: 'All categories' },
          { value: UNCATEGORISED, label: 'Uncategorised' },
          ...allCats.map((c) => ({ value: c.name, label: c.name })),
        ]}
      />
      <CapsuleSelect
        value={value.subcategory}
        onChange={(v) => patch({ subcategory: v })}
        disabled={subcatScope.length === 0}
        options={[
          { value: 'All', label: 'All subcategories' },
          ...subcatScope.map((s) => ({ value: s.name, label: s.name })),
        ]}
      />
      <CapsuleSelect
        value={value.account}
        onChange={(v) => patch({ account: v })}
        options={[{ value: 'All', label: 'All accounts' }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]}
      />
      <CapsuleSelect
        value={value.month}
        onChange={(v) => patch({ month: v })}
        options={[{ value: 'All', label: 'All months' }, ...months.map((m) => ({ value: m, label: monthLabel(m) }))]}
      />

      {hasAnyFilter ? (
        <button
          type="button"
          onClick={() => onChange(emptyTxFilters())}
          className="px-1 text-[13px] text-ink-mute transition-colors hover:text-ink"
        >
          Clear
        </button>
      ) : null}

      <div className="ml-auto flex items-center gap-3">
        <span className="whitespace-nowrap text-[13px] tabular-nums text-ink-mute">
          Showing {shown} of {total}
        </span>
        <div className="flex h-8 w-[240px] items-center gap-2 rounded-control border border-line bg-surface px-3 transition-colors duration-150 focus-within:border-indigo hover:border-[color:var(--line-strong)]">
          <Icon name="search" size={14} className="shrink-0 text-ink-mute" />
          <input
            type="search"
            placeholder="Search merchant or note"
            value={value.search}
            onChange={(e) => patch({ search: e.target.value })}
            className="w-full bg-transparent text-[14px] text-ink placeholder:text-ink-mute focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

function CapsuleSelect({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: DropdownOption[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useDismissable<HTMLDivElement>(open, () => setOpen(false));
  const engaged = value !== 'All';
  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-8 max-w-[190px] items-center gap-1.5 rounded-control border pl-3 pr-2 text-[13px] font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50',
          engaged
            ? 'border-indigo bg-indigo/10 text-indigo'
            : 'border-line bg-surface text-ink-soft hover:bg-raised hover:text-ink',
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <Icon
          name="chevron-down"
          size={14}
          className={cn(
            'shrink-0 transition-transform duration-150 ease-theus',
            open && 'rotate-180',
            engaged ? 'text-indigo' : 'text-ink-mute',
          )}
        />
      </button>
      {open ? (
        <OptionsList
          options={options}
          value={value}
          onSelect={(v) => {
            onChange(v);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
