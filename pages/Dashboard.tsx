import React, { useState } from 'react';
import { ComplianceStatus } from '../types';
import { useWorkspace } from '../context/WorkspaceContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, ScatterChart, XAxis, YAxis, Scatter, CartesianGrid, AreaChart, Area } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, ShieldAlert, Globe, Search, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { suppliers } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState('');

  const compliant = suppliers.filter(s => s.complianceStatus === ComplianceStatus.COMPLIANT).length;
  const expired = suppliers.filter(s => s.complianceStatus === ComplianceStatus.EXPIRED).length;
  const pending = suppliers.filter(s => s.complianceStatus === ComplianceStatus.PENDING).length;
  const critical = suppliers.filter(s => s.riskScore > 75).length;

  // Enterprise Analytics
  const avgRisk = Math.round(suppliers.reduce((acc, s) => acc + s.riskScore, 0) / (suppliers.length || 1));
  const avgESG = Math.round(suppliers.reduce((acc, s) => acc + (s.esgScore || 0), 0) / (suppliers.length || 1));
  const openNCs = suppliers.reduce((acc, s) => acc + s.nonConformities.filter(nc => nc.status !== 'RESOLVED').length, 0);

  const pieData = [
    { name: 'Conforme', value: compliant, color: '#10b981' },
    { name: 'À risque', value: expired, color: '#f43f5e' },
    { name: 'En attente', value: pending, color: '#f59e0b' },
  ];

  const scatterData = suppliers.map(s => ({
    x: s.riskScore,
    y: s.products.length,
    name: s.name,
    status: s.complianceStatus
  }));

  // ESG performance data (mocked trend)
  const esgTrend = [
    { month: 'Jan', score: 62 },
    { month: 'Feb', score: 65 },
    { month: 'Mar', score: 68 },
    { month: 'Apr', score: avgESG },
  ];

  const filteredQuickSearch = searchTerm.length > 2
    ? suppliers.flatMap(s => s.products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => ({ ...p, supplier: s.name })))
    : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full animate-fade-in relative pb-20">

      {/* Global Search Bar (Premium Global Search) */}
      <div className="relative group max-w-2xl mx-auto mb-10">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Recherche de crise : Ingrédient, Allergène, Produit..."
          className="w-full h-16 bg-white border border-slate-100 rounded-3xl pl-14 pr-6 text-slate-900 shadow-xl shadow-slate-200/50 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {filteredQuickSearch.length > 0 && (
          <div className="absolute top-20 left-0 right-0 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 p-4 max-h-[300px] overflow-y-auto animate-slide-up">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Résultats de crise / Produits</h4>
            {filteredQuickSearch.map((res, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all border-b border-slate-50 last:border-0 group">
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{res.name}</div>
                  <div className="text-xs text-slate-500 font-medium">{res.supplier} • {res.category}</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enterprise KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-700 opacity-50" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Score de Risque Moyen</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-slate-900">{avgRisk}%</span>
            <span className={`flex items-center text-xs font-bold mb-1.5 ${avgRisk < 30 ? 'text-emerald-500' : 'text-rose-500'}`}>
              <Activity className="w-3.5 h-3.5 mr-1" /> Monitoring
            </span>
          </div>
          <div className="mt-4 w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${avgRisk > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${avgRisk}%` }} />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Index de Durabilité ESG</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-slate-900">{avgESG}%</span>
            <span className="flex items-center text-xs font-bold mb-1.5 text-indigo-500">
              <Globe className="w-3.5 h-3.5 mr-1" /> RSE Impact
            </span>
          </div>
          <div className="mt-4 flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <div key={i} className={`flex-1 h-3 rounded-sm ${i * 10 <= avgESG ? 'bg-indigo-500' : 'bg-slate-100'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Non-Conformités Ouvertes</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-rose-600">{openNCs}</span>
            <span className="flex items-center text-xs font-bold mb-1.5 text-rose-500">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Action CAPA
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-4 uppercase tracking-tighter">Plan d'action correctif requis</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldAlert className="w-24 h-24" /></div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Audit Readiness</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black">{compliant > 0 ? Math.round((compliant / suppliers.length) * 100) : 0}%</span>
            <span className="flex items-center text-xs font-bold mb-1.5 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Ready
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase text-slate-500">
            <span>{compliant} Fournisseurs OK</span>
            <span>{suppliers.length} Total</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Visualization */}
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-xl text-slate-900">Cartographie des Risques</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Niveau d'exposition supply chain</p>
            </div>
            <div className="shrink-0 w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontalVertical={true} />
                <XAxis type="number" dataKey="x" name="Risque" unit="%" domain={[0, 100]} stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                <YAxis type="number" dataKey="y" name="Volume" unit=" un." stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100">
                          <p className="font-black text-slate-900 text-sm mb-1">{data.name}</p>
                          <div className="flex gap-4">
                            <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Risque</p><p className="font-bold text-rose-500">{data.x}%</p></div>
                            <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Produits</p><p className="font-bold text-slate-900">{data.y}</p></div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Fournisseurs" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.x > 75 ? '#f43f5e' : entry.x > 40 ? '#f59e0b' : '#10b981'} strokeWidth={entry.x > 75 ? 10 : 0} stroke={entry.x > 75 ? 'rgba(244, 63, 94, 0.1)' : 'transparent'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ESG Trend (Enterprise addition) */}
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-black text-xl text-slate-900">Performance ESG Globale</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Conformité durable et RSE</p>
            </div>
            <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${avgESG > 60 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
              Impact Positif
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={esgTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEsg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="month" stroke="#cbd5e1" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorEsg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;