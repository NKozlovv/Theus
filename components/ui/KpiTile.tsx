import { cn } from '@/lib/utils';
import { Mono } from './Mono';
import { Num } from './Num';
import { Icon, type IconName } from './Icon';

/**
 * KpiTile — a label, a figure, optionally what it changed against. Flat
 * card, no overlays.
 */
export function KpiTile({
  label,
  value,
  cents,
  delta,
  deltaTone = 'pos',
  deltaIcon,
  sub,
  className,
  children,
}: {
  label: string;
  value: string;
  cents?: string;
  delta?: string;
  deltaTone?: 'pos' | 'neg' | 'mute';
  deltaIcon?: IconName;
  sub?: string;
  /** Kept for old call sites; no longer changes anything. */
  hero?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('glass-tile p-5', className)}>
      <Mono size="sm" tone="mute">
        {label}
      </Mono>
      <div className="mt-3 flex items-baseline gap-1">
        <Num size={32} weight={500}>
          {value}
        </Num>
        {cents ? (
          <Num size={20} weight={400} tone="mute">
            {cents}
          </Num>
        ) : null}
      </div>
      {(delta || sub) && (
        <div className="mt-2 flex items-baseline gap-2">
          {delta && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[12px] tabular-nums',
                deltaTone === 'pos' && 'text-in',
                deltaTone === 'neg' && 'text-out',
                deltaTone === 'mute' && 'text-ink-mute',
              )}
            >
              {deltaIcon ? <Icon name={deltaIcon} size={12} /> : null}
              {delta}
            </span>
          )}
          {sub && <span className="text-[12px] text-ink-mute">{sub}</span>}
        </div>
      )}
      {children}
    </div>
  );
}
