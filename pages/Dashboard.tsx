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

  // Global Document Alerts
  const allDocs = suppliers.flatMap(s =>
    (s.attachments || []).map(a => ({ ...a, supplierName: s.name }))
  );

  const alerts = allDocs.filter(d => {
    if (!d.validUntil) return false;
    const expiry = new Date(d.validUntil);
    const today = new Date();
    const diff = expiry.getTime() - today.getTime();
    return diff < (30 * 1000 * 60 * 60 * 24); // Less than 30 days or expired
  }).sort((a, b) => new Date(a.validUntil!).getTime() - new Date(b.validUntil!).getTime());

  const getAlertStatus = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return diff < 0 ? 'CRITICAL' : 'WARNING';
  };

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
          className="w-full h-14 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-[var(--accent)]/10 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
              <Activity className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <span className="text-[9px] font-black text-[var(--success)] bg-[var(--success)]/10 px-2 py-1 rounded-md uppercase tracking-widest">Stable</span>
          </div>
          <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Score Risque Global</p>
          <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{avgRisk}%</h3>
          <div className="mt-4 w-full h-1 bg-[var(--bg-main)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accent)] transition-all duration-1000" style={{ width: `${avgRisk}%` }} />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Taux de Conformité</p>
          <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{totalSuppliers > 0 ? Math.round((compliantCount / totalSuppliers) * 100) : 0}%</h3>
          <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-bold uppercase tracking-tight">{compliantCount} partenaires certifiés</p>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Dossiers Critiques</p>
          <h3 className="text-3xl font-black text-rose-500 tracking-tight">{criticalCount}</h3>
          <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-bold uppercase tracking-tight">Vigilance renforcée</p>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-1">Doc. Alertes</p>
          <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{alerts.length}</h3>
          <p className="text-[10px] text-[var(--text-secondary)] mt-2 font-bold uppercase tracking-tight">Mises à jour requises</p>
        </div>
      </div>

      {/* Alert Banner / List */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
          <div className="bg-[var(--bg-card)] p-8 rounded-xl border border-[var(--border-subtle)] border-l-4 border-l-rose-500 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <AlertTriangle className="w-32 h-32" />
            </div>
            <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500" /> Alertes de Validité Documents
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 scrollbar-hide">
              {alerts.map((alert, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[var(--bg-main)]/50 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${getAlertStatus(alert.validUntil!) === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[var(--text-primary)]">{alert.fileName}</p>
                      <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{alert.supplierName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${getAlertStatus(alert.validUntil!) === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'}`}>
                      {getAlertStatus(alert.validUntil!) === 'CRITICAL' ? 'EXPIRÉ' : `Expire le ${new Date(alert.validUntil!).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-xl text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400" /> Actions Recommandées
            </h3>
            <ul className="space-y-4 relative z-10">
              <li className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-[10px]">01</div>
                <p className="text-xs font-bold uppercase tracking-tight">Relancer les {alerts.filter(a => getAlertStatus(a.validUntil!) === 'CRITICAL').length} fournisseurs expirés</p>
              </li>
              <li className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-[10px]">02</div>
                <p className="text-xs font-bold uppercase tracking-tight">Planifier l'archivage des fiches obsolètes</p>
              </li>
              <li className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-[10px]">03</div>
                <p className="text-xs font-bold uppercase tracking-tight">Mettre à jour les habilitations inspecteurs</p>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="bg-[var(--bg-card)] p-8 rounded-xl border border-[var(--border-subtle)] lg:col-span-2 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-black text-lg uppercase tracking-tight text-[var(--text-primary)]">Performance & Risque</h3>
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">Tendance consolidée (4 mois)</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_rgba(255,107,0,0.4)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Indice ESG</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Indice Risque</span>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-muted)', fontWeight: 800 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-muted)', fontWeight: 800 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontSize: '10px', fontWeight: 700, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
                <Area type="monotone" dataKey="esg" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorEsg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-8 rounded-xl border border-[var(--border-subtle)] shadow-sm relative overflow-hidden">
          <h3 className="font-black text-lg uppercase tracking-tight text-[var(--text-primary)] mb-1">Conformité</h3>
          <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-8">Status des dossiers</p>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{totalSuppliers}</span>
              <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1">Total</span>
            </div>
          </div>
          <div className="space-y-4 mt-6">
            {complianceData.map((item, id) => (
              <div key={id} className="flex items-center justify-between p-3 bg-[var(--bg-main)]/50 rounded-lg border border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}66` }} />
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-xs font-black text-[var(--text-primary)]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;