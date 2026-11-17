'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'icon';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-indigo text-white hover:bg-indigo-dark',
  secondary: 'border border-line bg-surface text-ink hover:bg-raised',
  ghost: 'text-ink-soft hover:bg-raised hover:text-ink',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-control gap-1.5',
  md: 'h-9 px-4 text-[14px] rounded-control gap-1.5',
  icon: 'h-8 w-8 rounded-control',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

/**
 * Button — 10px radius, flat fills. Hover is a color step, press is a 2%
 * scale down. Nothing lifts or glows.
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
        'inline-flex items-center justify-center font-sans font-medium',
        'transition-[transform,background-color,color] duration-150 ease-theus active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
});
