import React, { useState } from 'react';
import { Supplier } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Search, MapPin, MoreHorizontal, Filter } from 'lucide-react';

const Suppliers: React.FC<{ suppliers: Supplier[] }> = ({ suppliers }) => {
  const [term, setTerm] = useState('');

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(term.toLowerCase()) || 
    s.country.toLowerCase().includes(term.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Catalogue Fournisseurs</h1>
        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors">
          + Nouveau Fournisseur
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium">
            <Filter size={18} /> Filtres
          </button>
        </div>

        {/* Table */}
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Nom de l'entreprise</th>
              <th className="px-6 py-4">Pays</th>
              <th className="px-6 py-4">Score Risque</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-100 to-white border border-brand-200 flex items-center justify-center font-bold text-brand-600">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-500">ID: {s.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" /> {s.country}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${s.riskScore > 75 ? 'bg-rose-500' : s.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${s.riskScore}%` }} 
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{s.riskScore}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={s.complianceStatus} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand-600 transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Suppliers;