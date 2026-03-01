import React, { useState } from 'react';
import { Supplier } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Search, MapPin, ChevronRight, SlidersHorizontal } from 'lucide-react';

const Suppliers: React.FC<{ suppliers: Supplier[] }> = ({ suppliers }) => {
  const [term, setTerm] = useState('');

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(term.toLowerCase()) ||
    s.country.toLowerCase().includes(term.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Page header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Catalogue fournisseurs</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Vue d'ensemble de la base de partenaires</p>
        </div>
        <button className="flex items-center gap-2 bg-[var(--accent)] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-orange-500/20 hover:opacity-90 transition-all">
          + Nouveau partenaire
        </button>
      </div>

      {/* Card */}
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        {/* Filters bar */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex gap-3 items-center">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
            <input
              type="text"
              placeholder="Rechercher un fournisseur…"
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-[var(--bg-main)] border border-[var(--border-subtle)]"
              value={term}
              onChange={e => setTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all">
            <SlidersHorizontal className="w-4 h-4" /> Filtres
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-main)]/50">
                <th className="px-6 py-3.5 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">Fournisseur</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">Localisation</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">Score de risque</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">Statut</th>
                <th className="px-6 py-3.5 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-[var(--bg-hover)] transition-all group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center font-semibold text-sm group-hover:bg-[var(--accent)] group-hover:text-white transition-all duration-200">
                        {s.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-[var(--text-primary)] truncate">{s.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate">ID : {s.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                      <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" /> {s.country}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${s.riskScore > 60 ? 'bg-rose-500' : s.riskScore > 35 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${s.riskScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[var(--text-secondary)] w-8">{s.riskScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={s.complianceStatus} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-[var(--accent-subtle)] transition-all">
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-[var(--text-muted)]">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucun fournisseur trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Suppliers;