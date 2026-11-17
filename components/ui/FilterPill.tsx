'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from './Icon';

type FilterPillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  icon?: IconName;
  trailingIcon?: IconName;
};

/**
 * Filter chip (All / Expenses / Income / Adjustments, and the dropdown
 * triggers beside them). Rest: surface with a hairline. Selected: the
 * accent as a flat fill. Same 10px radius as every other control.
 */
export const FilterPill = forwardRef<HTMLButtonElement, FilterPillProps>(function FilterPill(
  { active, icon, trailingIcon, children, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-control border px-3 text-[13px] font-medium',
        'transition-colors duration-150 ease-theus',
        active
          ? 'border-indigo bg-indigo text-white'
          : 'border-line bg-surface text-ink-soft hover:bg-raised hover:text-ink',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      {icon ? <Icon name={icon} size={14} /> : null}
      <span>{children}</span>
      {trailingIcon ? <Icon name={trailingIcon} size={14} /> : null}
    </button>
  );
});
