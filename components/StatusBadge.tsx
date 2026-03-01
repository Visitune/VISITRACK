import React from 'react';
import { ComplianceStatus } from '../types';

interface StatusBadgeProps {
  status: ComplianceStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isSmall = size === 'sm';
  const base = `inline-flex items-center gap-1.5 font-semibold rounded-md ${isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`;

  const map: Record<string, { label: string; cls: string; dot: string }> = {
    COMPLIANT: { label: 'Conforme', cls: 'bg-emerald-500/12 text-emerald-600 border border-emerald-500/25', dot: 'bg-emerald-500' },
    PENDING: { label: 'En attente', cls: 'bg-amber-500/12 text-amber-600 border border-amber-500/25', dot: 'bg-amber-500 animate-pulse' },
    NON_COMPLIANT: { label: 'Non conforme', cls: 'bg-rose-500/12 text-rose-500 border border-rose-500/25', dot: 'bg-rose-500' },
    UNDER_REVIEW: { label: 'En révision', cls: 'bg-blue-500/12 text-blue-500 border border-blue-500/25', dot: 'bg-blue-500' },
    EXPIRED: { label: 'Expiré', cls: 'bg-zinc-500/12 text-zinc-500 border border-zinc-500/25', dot: 'bg-zinc-400' },
    APPROVED: { label: 'Approuvé', cls: 'bg-emerald-500/12 text-emerald-600 border border-emerald-500/25', dot: 'bg-emerald-500' },
    REJECTED: { label: 'Rejeté', cls: 'bg-rose-500/12 text-rose-500 border border-rose-500/25', dot: 'bg-rose-500' },
    NEW: { label: 'Nouveau', cls: 'bg-violet-500/12 text-violet-500 border border-violet-500/25', dot: 'bg-violet-500' },
  };

  const config = map[String(status).toUpperCase()] ?? { label: String(status), cls: 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20', dot: 'bg-zinc-400' };

  return (
    <span className={`${base} ${config.cls}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;