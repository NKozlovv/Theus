'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Icon } from '@/components/ui';
import { useDismissable } from '@/components/ui/useDismissable';
import { cn } from '@/lib/utils';

/** "{year} ▾" — year picker for the Trends header. */
export function YearSelect({ years, selected }: { years: number[]; selected: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useDismissable<HTMLDivElement>(open, () => setOpen(false));

  function select(y: number) {
    setOpen(false);
    router.push(`${pathname}?year=${y}`);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line bg-surface px-3 text-[14px] font-medium text-ink transition-colors duration-150 hover:bg-raised"
      >
        {selected}
        <Icon name="chevron-down" size={14} className={cn('transition-transform duration-150 ease-theus', open && 'rotate-180')} />
      </button>
      {open ? (
        <div className="glass-popover absolute right-0 top-full z-30 mt-2 min-w-[100px] p-1">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => select(y)}
              className={cn(
                'block w-full rounded-[8px] px-3 py-2 text-left text-[14px] transition-colors',
                y === selected ? 'bg-raised font-medium text-ink' : 'text-ink-soft hover:bg-raised hover:text-ink',
              )}
            >
              {y}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
