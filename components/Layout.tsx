import React, { useRef, useState } from 'react';
import { LayoutDashboard, Users, ShieldCheck, BarChart3, LogOut, Upload, Download, Trash2, Settings, HelpCircle, Bell, Check, X, Info, AlertTriangle, AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';

interface LayoutProps {
  children: React.ReactNode;
}

const NotificationCenter = () => {
  const { notifications, markNotificationAsRead, clearNotifications } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'SUCCESS': return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' };
      case 'WARNING': return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' };
      case 'ERROR': return { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' };
      default: return { icon: Info, color: 'text-indigo-500', bg: 'bg-indigo-50' };
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-all shadow-sm group"
      >
        <Bell className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce-subtle">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-3 w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 z-40 overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900">Notifications</h3>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{unreadCount} non-lues</p>
              </div>
              <button
                onClick={clearNotifications}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
              >
                Tout effacer
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-medium italic">Aucune notification.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const styles = getTypeStyles(n.type);
                  return (
                    <div
                      key={n.id}
                      className={`p-5 flex gap-4 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 relative group ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
                    >
                      <div className={`shrink-0 w-10 h-10 rounded-xl ${styles.bg} flex items-center justify-center`}>
                        <styles.icon className={`w-5 h-5 ${styles.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <h4 className={`text-sm font-bold truncate ${!n.isRead ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</h4>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{n.message}</p>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={() => markNotificationAsRead(n.id)}
                          className="opacity-0 group-hover:opacity-100 absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white border border-slate-100 rounded-lg shadow-sm text-emerald-600 hover:bg-emerald-50 transition-all"
                          title="Marquer comme lu"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { exportWorkspace, importWorkspace, resetWorkspace, settings, suppliers } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePage = location.pathname;

  const menuItems = [
    { id: '/dashboard', label: 'Pilotage & Risque', icon: LayoutDashboard },
    { id: '/suppliers', label: 'Hub Fournisseurs', icon: Users },
    { id: '/compliance', label: 'Moteur Documents', icon: ShieldCheck },
    { id: '/campaigns', label: 'Relances & Collecte', icon: Send },
    { id: '/analytics', label: 'Rapports d\'Audit', icon: BarChart3 },
    { id: '/settings', label: 'Paramètres', icon: Settings },
    { id: '/guide', label: 'Guide Utilisateur', icon: HelpCircle },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importWorkspace(file);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FC] text-slate-800 font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".json"
      />

      {/* Premium Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-[#1e1b4b] to-[#312e81] text-white flex flex-col shadow-2xl z-20 m-0 md:m-4 md:rounded-3xl shrink-0">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border border-white/20 overflow-hidden group">
              <img
                src="https://raw.githubusercontent.com/M00N69/RAPPELCONSO/main/logo%2004%20copie.jpg"
                alt="Vispilot Logo"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight block">VISITrack</span>
              <span className="text-[10px] uppercase tracking-widest text-indigo-300 font-semibold truncate max-w-[120px]" title={settings.companyName}>
                {settings.companyName}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all duration-200 group relative overflow-hidden ${activePage === item.id || (activePage === '/' && item.id === '/dashboard')
                ? 'bg-white/10 text-white shadow-lg border border-white/10 backdrop-blur-sm'
                : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activePage === item.id || (activePage === '/' && item.id === '/dashboard') ? 'text-white' : 'text-indigo-300'}`} />
              {item.label}
              {(activePage === item.id || (activePage === '/' && item.id === '/dashboard')) && <div className="absolute right-0 top-0 bottom-0 w-1 rounded-l-full shadow-[0_0_10px_rgba(52,211,153,0.5)] bg-emerald-400" />}
            </button>
          ))}
        </nav>

        {/* Storage Monitoring */}
        <div className="px-6 mb-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Utilisation Stockage</span>
              <span className="text-[10px] font-black text-white bg-indigo-500 px-2 py-0.5 rounded-full">
                {(JSON.stringify(suppliers).length / 1024).toFixed(0)} KB / 5MB
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${(JSON.stringify(suppliers).length / (5 * 1024 * 1024)) * 100 > 80 ? 'bg-rose-500' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'}`}
                style={{ width: `${Math.min(100, (JSON.stringify(suppliers).length / (5 * 1024 * 1024)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Workspace Controls (VISITrack v7) */}
        <div className="p-6 bg-black/20 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-4 py-1">
            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">Enterprise v7.0</span>
          </div>
          <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-4">Moteur de GED & Sync</p>
          <div className="space-y-2">
            <button
              onClick={exportWorkspace}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all text-white shadow-lg shadow-indigo-900/40 border border-white/10"
              title="Exporter le package complet (.json)"
            >
              <Download className="w-4 h-4" /> Sauvegarder Pack
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold bg-white/5 hover:bg-white/10 rounded-xl transition-all text-indigo-100 border border-white/5"
                title="Importer un package de sauvegarde"
              >
                <Upload className="w-4 h-4" /> Restaurer
              </button>
              <button
                onClick={resetWorkspace}
                className="flex items-center justify-center px-4 py-3 text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all text-rose-300 border border-rose-500/10"
                title="Flush Workspace (Restauration d'usine)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
        {/* Simple Header */}
        <header className="px-8 py-6 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {menuItems.find((i) => i.id === activePage)?.label || 'Pilotage & Risque'}
            </h1>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">VISITrack Hub • {settings.companyName}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Workspace Synced</span>
            </div>

            <NotificationCenter />

            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-slate-200 uppercase">
              {settings.companyName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;