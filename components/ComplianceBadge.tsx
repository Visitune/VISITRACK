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
      colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
      dotClass = 'bg-emerald-500';
      label = 'Conforme';
      break;
    case ComplianceStatus.PENDING:
      colorClass = 'bg-amber-50 text-amber-700 border-amber-100';
      dotClass = 'bg-amber-500';
      label = 'En Attente';
      break;
    case ComplianceStatus.EXPIRED:
      colorClass = 'bg-rose-50 text-rose-700 border-rose-100';
      dotClass = 'bg-rose-500';
      label = 'Expiré';
      break;
    case ComplianceStatus.REJECTED:
      colorClass = 'bg-red-50 text-red-700 border-red-100';
      dotClass = 'bg-red-500';
      label = 'Rejeté';
      break;
    default:
      colorClass = 'bg-gray-50 text-gray-700 border-gray-100';
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