import React from 'react';
import { ComplianceStatus } from '../types';

interface ComplianceBadgeProps {
  status: ComplianceStatus;
  size?: 'sm' | 'md';
}

const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({ status, size = 'md' }) => {
  let colorClass = '';
  let dotClass = '';
  let label = '';

  switch (status) {
    case ComplianceStatus.COMPLIANT:
      colorClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      dotClass = 'bg-emerald-500';
      label = 'Conforme';
      break;
    case ComplianceStatus.PENDING:
      colorClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      dotClass = 'bg-amber-500';
      label = 'En Attente';
      break;
    case ComplianceStatus.EXPIRED:
      colorClass = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      dotClass = 'bg-rose-500';
      label = 'Expiré';
      break;
    case ComplianceStatus.REJECTED:
      colorClass = 'bg-red-500/10 text-red-500 border-red-500/20';
      dotClass = 'bg-red-500';
      label = 'Rejeté';
      break;
    default:
      colorClass = 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      dotClass = 'bg-gray-500';
      label = status;
  }

  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-2 font-semibold rounded-full border ${colorClass} ${sizeClass} shadow-sm`}>
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotClass}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotClass}`}></span>
      </span>
      {label}
    </span>
  );
};

export default ComplianceBadge;