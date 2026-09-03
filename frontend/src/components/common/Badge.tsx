import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'lime' | 'forest' | 'neutral' | 'high' | 'medium' | 'low' | 'success' | 'warning' | 'danger';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'forest',
  className,
  size = 'sm',
}) => {
  const base = 'inline-flex items-center font-mono font-medium rounded-full tracking-wide';

  const sizeMap = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };

  const variantMap = {
    forest: 'bg-zinc-900 text-white',
    lime: 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold',
    neutral: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
    high: 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold',
    medium: 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold',
    low: 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold',
  };

  return (
    <span className={twMerge(clsx(base, sizeMap[size], variantMap[variant], className))}>
      {children}
    </span>
  );
};
