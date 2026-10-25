import React from 'react';
import { IncidentStatus, AmbulanceStatus } from '../../types/index.ts';
import { Clock, Radio, Truck, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: IncidentStatus | AmbulanceStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';

  const config: Record<
    string,
    { text: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    Reported: {
      text: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      icon: AlertOctagon,
    },
    'Under Review': {
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      icon: Clock,
    },
    'Unit Assigned': {
      text: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      icon: Radio,
    },
    Assigned: {
      text: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      icon: Radio,
    },
    'En Route': {
      text: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      icon: Truck,
    },
    Arrived: {
      text: 'text-[#18B6A4]',
      bg: 'bg-[#18B6A4]/10',
      border: 'border-[#18B6A4]/25',
      icon: CheckCircle2,
    },
    'At Scene': {
      text: 'text-[#18B6A4]',
      bg: 'bg-[#18B6A4]/10',
      border: 'border-[#18B6A4]/25',
      icon: CheckCircle2,
    },
    Resolved: {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      icon: CheckCircle2,
    },
    Available: {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      icon: CheckCircle2,
    },
    'Out of Service': {
      text: 'text-slate-500',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/20',
      icon: HelpCircle,
    },
  };

  const item = config[status] || {
    text: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    icon: HelpCircle,
  };

  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium tracking-normal rounded-md border ${
        item.bg
      } ${item.border} ${item.text} ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{status}</span>
    </span>
  );
};
