import React from 'react';
import { ComplianceStatus } from '../types';

export const StatusBadge = ({ status }: { status: ComplianceStatus }) => {
  const styles = {
    COMPLIANT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    EXPIRED: 'bg-rose-50 text-rose-700 border-rose-200',
    REJECTED: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const labels = {
    COMPLIANT: 'Conforme',
    PENDING: 'En Attente',
    EXPIRED: 'Expiré',
    REJECTED: 'Rejeté',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};