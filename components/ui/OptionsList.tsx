import { Icon } from './Icon';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

/**
 * The themed popup panel shared by Select and Filters' PillSelect —
 * replaces the browser's native, unthemeable <select> popup.
 *
 * Single-select (default): pass `value`; `onSelect` fires once and the
 * caller typically closes the popup itself. Multi-select: pass `selected`
 * (a Set) instead of `value` — each row's checked state comes from set
 * membership rather than equality, so more than one row can be highlighted
 * at once. Whether the popup stays open after a click is entirely up to
 * the caller's `onSelect` handler; this component doesn't manage that.
 */
export function OptionsList({
  options,
  value,
  selected,
  onSelect,
  className,
}: {
  options: DropdownOption[];
  value?: string;
  /** Multi-select mode: row `isSelected` comes from `selected.has(value)` instead of `value` equality. */
  selected?: Set<string>;
  onSelect: (value: string) => void;
  className?: string;
}) {
  return (
    <div
      role="listbox"
      aria-multiselectable={selected ? true : undefined}
      className={cn(
        'glass-popover absolute z-50 mt-1 max-h-64 min-w-full overflow-auto p-1',
        className,
      )}
    >
      {options.map((o, i) => {
        const isSelected = selected ? selected.has(o.value) : o.value === value;
        return (
          <button
            key={o.value || i}
            type="button"
            role="option"
            aria-selected={isSelected}
            disabled={o.disabled}
            onClick={() => !o.disabled && onSelect(o.value)}
            className={cn(
              'flex w-full items-center justify-between gap-2 rounded-[8px] px-3 py-2 text-left text-[14px] transition-colors',
              isSelected ? 'bg-raised font-medium text-ink' : 'text-ink hover:bg-raised',
              o.disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent',
            )}
          >
            <span className="truncate">{o.label}</span>
            {isSelected ? <Icon name="check" size={14} className="shrink-0 text-indigo" /> : null}
          </button>
        );
      })}
    </div>
  );
}
