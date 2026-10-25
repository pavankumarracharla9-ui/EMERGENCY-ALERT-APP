import React from 'react';
import { PriorityLevel } from '../../types/index.ts';
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const isSm = size === 'sm';

  const config = {
    Critical: {
      text: 'text-[#E53945]',
      bg: 'bg-[#E53945]/10',
      border: 'border-[#E53945]/25',
      icon: ShieldAlert,
    },
    High: {
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/25',
      icon: AlertTriangle,
    },
    Moderate: {
      text: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/25',
      icon: Info,
    },
    Low: {
      text: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/20',
      icon: AlertCircle,
    },
  }[priority] || {
    text: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    icon: Info,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold tracking-wide rounded-md border ${
        config.bg
      } ${config.border} ${config.text} ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{priority}</span>
    </span>
  );
};
