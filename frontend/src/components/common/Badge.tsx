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
    forest: 'bg-[#0D2818] text-[#FAF7F2]',
    lime: 'bg-[#84CC16] text-[#0D2818] font-bold',
    neutral: 'bg-[#0D2818]/5 text-[#0D2818] border border-[#0D2818]/15',
    high: 'bg-rose-100 text-rose-800 border border-rose-300 font-semibold',
    medium: 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold',
    low: 'bg-sky-100 text-sky-800 border border-sky-300 font-semibold',
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold',
    warning: 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold',
    danger: 'bg-rose-100 text-rose-800 border border-rose-300 font-semibold',
  };

  return (
    <span className={twMerge(clsx(base, sizeMap[size], variantMap[variant], className))}>
      {children}
    </span>
  );
};
