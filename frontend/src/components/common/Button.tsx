import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#0D2818] text-white hover:bg-[#163E2B] focus:ring-[#84CC16] shadow-sm',
    secondary: 'bg-[#FAF7F2] text-[#0D2818] hover:bg-[#EBE3D5] border border-[#0D2818]/15 focus:ring-[#0D2818]',
    accent: 'bg-[#84CC16] text-[#0D2818] hover:bg-[#A3E635] focus:ring-[#84CC16] font-semibold shadow-sm',
    outline: 'bg-transparent text-[#0D2818] border border-[#0D2818]/25 hover:bg-[#0D2818]/5 focus:ring-[#0D2818]',
    ghost: 'bg-transparent text-[#0D2818] hover:bg-[#0D2818]/5 focus:ring-[#0D2818]',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
