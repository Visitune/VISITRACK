import React from 'react';
import { ComplianceStatus } from '../types';

interface ComplianceBadgeProps {
  status: ComplianceStatus;
  size?: 'sm' | 'md';
}

const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<ComplianceStatus, { label: string; base: string; dot?: string }> = {
    [ComplianceStatus.COMPLIANT]: {
      label: 'Conforme',
      base: 'bg-emerald-500/12 text-emerald-600 border border-emerald-500/25',
      dot: 'bg-emerald-500'
    },
    [ComplianceStatus.PENDING]: {
      label: 'En attente',
      base: 'bg-amber-500/12 text-amber-600 border border-amber-500/25',
      dot: 'bg-amber-500'
    },
    [ComplianceStatus.NON_COMPLIANT]: {
      label: 'Non conforme',
      base: 'bg-rose-500/12 text-rose-600 border border-rose-500/25',
      dot: 'bg-rose-500'
    },
    [ComplianceStatus.UNDER_REVIEW]: {
      label: 'En révision',
      base: 'bg-blue-500/12 text-blue-600 border border-blue-500/25',
      dot: 'bg-blue-500'
    },
    [ComplianceStatus.EXPIRED]: {
      label: 'Expiré',
      base: 'bg-red-500/12 text-red-500 border border-red-500/25',
      dot: 'bg-red-500'
    },
    [ComplianceStatus.REJECTED]: {
      label: 'Refusé',
      base: 'bg-red-600/12 text-red-700 border border-red-600/25',
      dot: 'bg-red-600'
    },
  };

  const config = configs[status] || configs[ComplianceStatus.PENDING];
  const isSmall = size === 'sm';

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-md ${config.base} ${isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'}`}>
      {config.dot && (
        <span className={`inline-block rounded-full ${config.dot} ${isSmall ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}></span>
      )}
      {config.label}
    </span>
  );
};

export default ComplianceBadge;