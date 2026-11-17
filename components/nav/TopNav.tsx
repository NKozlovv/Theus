'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon, type IconName } from '@/components/ui';
import { useDismissable } from '@/components/ui/useDismissable';
import { BudgetSwitcher } from './BudgetSwitcher';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { TheusMark } from '@/components/auth/TheusMark';
import type { Budget } from '@/lib/supabase/types';

const TABS: { href: string; label: string }[] = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/trends', label: 'Trends' },
  { href: '/trips', label: 'Trips' },
  { href: '/categories', label: 'Categories' },
  { href: '/accounts', label: 'Accounts' },
  { href: '/forecast', label: 'Forecast' },
  { href: '/investing', label: 'Investing' },
  { href: '/rsu', label: 'RSU' },
];

const MORE: { href: string; label: string; icon: IconName }[] = [
  { href: '/coach', label: 'Coach', icon: 'sparkle' },
  { href: '/members', label: 'Members', icon: 'user' },
  { href: '/import', label: 'Import CSV', icon: 'upload' },
];

function initialsFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  const parts = local.split(/[._+-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || '?';
}

const tabClass = (active: boolean) =>
  cn(
    'whitespace-nowrap rounded-control border px-3 py-1.5 text-[14px] font-medium',
    'transition-colors duration-150 ease-theus',
    active
      ? 'border-line bg-surface text-ink'
      : 'border-transparent text-ink-soft hover:bg-raised hover:text-ink',
  );

/**
 * Top bar — a flat strip on the page, pinned to the top with a hairline
 * underneath. Chrome, not content: no card, no blur, no shadow.
 *
 * Accounts and Forecast get full tabs; Coach/Members/Import — lower-
 * frequency routes — live behind "More" so the bar stays one row at every
 * width.
 */
export function TopNav({
  email,
  budgets,
  activeBudgetId,
}: {
  email: string;
  budgets: Budget[];
  activeBudgetId: string;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const moreRef = useDismissable<HTMLDivElement>(moreOpen, () => setMoreOpen(false));
  const accountRef = useDismissable<HTMLDivElement>(accountOpen, () => setAccountOpen(false));

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const moreActive = MORE.some((m) => isActive(m.href));
  const initials = initialsFromEmail(email);

  return (
    <nav className="sticky top-0 z-20 -mx-8 flex h-14 items-center gap-6 border-b border-line bg-paper px-8">
      <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
        <TheusMark size={22} />
        <span className="text-[17px] font-semibold text-ink">Theus</span>
      </Link>

      <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1">
        {TABS.map((tab) => (
          <Link key={tab.href} href={tab.href} className={tabClass(isActive(tab.href))}>
            {tab.label}
          </Link>
        ))}

        <div ref={moreRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={cn('inline-flex items-center gap-1', tabClass(moreActive))}
          >
            More
            <Icon
              name="chevron-down"
              size={14}
              className={cn('transition-transform duration-150 ease-theus', moreOpen && 'rotate-180')}
            />
          </button>
          {moreOpen ? (
            <div className="glass-popover absolute left-0 top-full z-30 mt-2 min-w-[192px] p-1">
              {MORE.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-[8px] px-3 py-2 text-[14px] font-medium transition-colors',
                    isActive(m.href) ? 'bg-raised text-ink' : 'text-ink-soft hover:bg-raised hover:text-ink',
                  )}
                >
                  <Icon name={m.icon} size={16} />
                  {m.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div ref={accountRef} className="relative">
          <button
            type="button"
            onClick={() => setAccountOpen((v) => !v)}
            className="flex items-center gap-2 rounded-control border border-line bg-surface py-1 pl-1 pr-3 transition-colors duration-150 hover:bg-raised"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-raised text-[12px] font-medium text-ink-soft">
              {initials}
            </span>
            <span className="max-w-[140px] truncate text-[13px] text-ink">{email}</span>
          </button>

          {accountOpen ? (
            <div className="glass-popover absolute right-0 top-full z-30 mt-2 w-[264px] p-3">
              <div className="flex flex-col gap-3">
                <BudgetSwitcher budgets={budgets} activeId={activeBudgetId} />
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <span className="text-[12px] text-ink-mute">{email}</span>
                  <SignOutButton />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
