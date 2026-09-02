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
          'rounded-3xl border border-[#0D2818]/10 p-6 transition-all duration-200',
          glass
            ? 'bg-white/70 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
            : 'bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)]',
          hover && 'hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:border-[#0D2818]/25 hover:-translate-y-0.5',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
