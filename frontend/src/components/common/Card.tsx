import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  glass = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl border border-zinc-200 p-5 shadow-xs transition-all duration-200 font-body',
          glass
            ? 'bg-white/60 backdrop-blur-xl border-white/50 shadow-[0_25px_80px_-12px_rgba(0,0,0,0.08)]'
            : 'bg-white/90 backdrop-blur-md',
          hover && 'hover:-translate-y-0.5 hover:shadow-md hover:border-zinc-300',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
