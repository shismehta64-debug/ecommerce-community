import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'info' | 'danger' | 'accent' | 'default';
  className?: string;
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold';
  
  const variants = {
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    danger: 'bg-rose-100 text-rose-800 border border-rose-200',
    info: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    accent: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    default: 'bg-slate-100 text-slate-800 border border-slate-200',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
