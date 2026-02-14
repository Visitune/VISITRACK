import React, { useState } from 'react';
import { ComplianceStatus } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  ShieldCheck, AlertTriangle, CheckCircle, Clock,
  Search, ArrowUpRight, Activity, Globe, Zap,
  ChevronRight, Filter
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { suppliers, rawMaterials = [], theme } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState('');

  // Metrics calculation
  const totalSuppliers = suppliers.length;
  const compliantCount = suppliers.filter(s => s.complianceStatus === ComplianceStatus.COMPLIANT).length;
  const criticalCount = suppliers.filter(s => s.riskScore > 75).length;
  const pendingCount = suppliers.filter(s => s.complianceStatus === ComplianceStatus.PENDING).length;

  const avgRisk = Math.round(suppliers.reduce((acc, s) => acc + s.riskScore, 0) / (totalSuppliers || 1));
  const avgESG = Math.round(suppliers.reduce((acc, s) => acc + (s.esgScore || 0), 0) / (totalSuppliers || 1));

  // Chart Data
  const complianceData = [
    { name: 'Conforme', value: compliantCount, color: 'var(--success)' },
    { name: 'En attente', value: pendingCount, color: 'var(--warning)' },
    { name: 'Non conforme', value: totalSuppliers - compliantCount - pendingCount, color: 'var(--danger)' },
  ];

  const riskTrend = [
    { month: 'Jan', risk: 45, esg: 60 },
    { month: 'Fév', risk: 42, esg: 62 },
    { month: 'Mar', risk: 38, esg: 65 },
    { month: 'Avr', risk: avgRisk, esg: avgESG },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Search Section */}
      <div className="relative group max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un fournisseur, produit ou matière..."
          className="w-full h-14 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-[var(--accent)]/20 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-premium p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
              <Activity className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <span className="text-[10px] font-bold text-[var(--success)] bg-[var(--success)]/10 px-2 py-1 rounded-full">+2.5%</span>
          </div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Score Risque Global</p>
          <h3 className="text-3xl font-bold">{avgRisk}%</h3>
          <div className="mt-4 w-full h-1 bg-[var(--bg-main)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accent)] transition-all duration-1000" style={{ width: `${avgRisk}%` }} />
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Taux de Conformité</p>
          <h3 className="text-3xl font-bold">{totalSuppliers > 0 ? Math.round((compliantCount / totalSuppliers) * 100) : 0}%</h3>
          <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">{compliantCount} fournisseurs conformes</p>
        </div>

        <div className="card-premium p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Fournisseurs Critiques</p>
          <h3 className="text-3xl font-bold text-rose-500">{criticalCount}</h3>
          <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">Action corrective requise</p>
        </div>

        <div className="card-premium p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Documents en Attente</p>
          <h3 className="text-3xl font-bold">{pendingCount}</h3>
          <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-medium">Relances automatiques actives</p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card-premium p-8 lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-lg">Performance & Risque</h3>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">Tendance des indicateurs clés sur 4 mois</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--accent)]" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Indice ESG</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Indice Risque</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrend}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEsg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)', fontWeight: 600 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
                <Area type="monotone" dataKey="esg" stroke="var(--accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorEsg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium p-8">
          <h3 className="font-bold text-lg mb-2">Conformité Globale</h3>
          <p className="text-[11px] text-[var(--text-muted)] font-medium mb-8">Statut des dossiers fournisseurs</p>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold">{totalSuppliers}</span>
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {complianceData.map((item, id) => (
              <div key={id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-[var(--text-secondary)] font-medium">{item.name}</span>
                </div>
                <span className="text-xs font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;