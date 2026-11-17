'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'icon';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-indigo text-white ' +
    'shadow-[0_6px_16px_-6px_rgba(31,39,66,0.5),inset_0_1px_0_rgba(255,255,255,0.28)] ' +
    'hover:bg-indigo-dark',
  secondary:
    'border border-white/90 text-ink [background:var(--glass-sheen-tile)] ' +
    'hover:bg-white',
  ghost: 'text-ink-soft hover:text-ink hover:bg-white/60',
};

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-2 text-[12.5px] rounded-full gap-1.5',
  md: 'px-[17px] py-[9px] text-[13.5px] rounded-full gap-1.5',
  icon: 'p-2 rounded-full',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

/**
 * Capsule button — 999px radius, five states. Hover is a color step (no
 * lift, no colored glow); the shadow is neutral navy, like every glass
 * panel's, so a button looks lit by the same light as the page.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center font-sans font-bold',
        'transition-[transform,box-shadow,background,color] duration-200 ease-theus',
        'focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_rgba(74,92,224,.25)]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
});
