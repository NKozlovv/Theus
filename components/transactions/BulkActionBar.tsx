'use client';

import { Button } from '@/components/ui';
import { fmtEUR } from '@/lib/money';

export function BulkActionBar({
  count,
  totalEUR,
  onEdit,
  onDelete,
  onClear,
  pending,
}: {
  count: number;
  totalEUR: number;
  onEdit: () => void;
  onDelete: () => void;
  onClear: () => void;
  pending: boolean;
}) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-30" style={{ transform: 'translateX(-50%)' }}>
      <div className="glass flex items-center gap-5 py-2 pl-4 pr-2 shadow-[0_8px_24px_rgba(23,23,23,0.14)]">
        <div className="flex items-baseline gap-3">
          <span className="text-[13px] font-medium text-ink">{count} selected</span>
          <span className="text-[13px] text-ink-soft">·</span>
          <span className="text-[13px] tabular-nums text-ink-soft">
            net {fmtEUR(totalEUR)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClear} disabled={pending}>
            Clear
          </Button>
          <Button variant="secondary" size="sm" onClick={onEdit} disabled={pending}>
            Edit
          </Button>
          <Button size="sm" onClick={onDelete} disabled={pending}>
            {pending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}
