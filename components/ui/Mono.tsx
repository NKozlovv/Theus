import { cn } from '@/lib/utils';

type Tone = 'default' | 'mute' | 'soft' | 'accent' | 'pos' | 'neg';
type Size = 'xs' | 'sm';

const TONE: Record<Tone, string> = {
  default: 'text-ink',
  mute: 'text-ink-mute',
  soft: 'text-ink-soft',
  accent: 'text-indigo',
  pos: 'text-in',
  neg: 'text-out',
};

// Both sizes land on 12px: nothing smaller reads comfortably, and a second
// near-identical size is just noise.
const SIZE: Record<Size, string> = {
  xs: 'text-[12px]',
  sm: 'text-[12px]',
};

/**
 * Small label / meta text. Sentence case, normal tracking, muted by
 * default. (The name is historical — it used to be an uppercase tracked
 * mono label.)
 */
export function Mono({
  children,
  tone = 'mute',
  size = 'sm',
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  size?: Size;
  className?: string;
}) {
  return <span className={cn('font-sans font-normal leading-4', SIZE[size], TONE[tone], className)}>{children}</span>;
}
