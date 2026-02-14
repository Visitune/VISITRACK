import React, { useRef, useState } from 'react';
import {
  LayoutDashboard, Users, ShieldCheck, BarChart3, LogOut, Upload, Download,
  Trash2, Settings, HelpCircle, Bell, Check, X, Info, AlertTriangle,
  AlertCircle, CheckCircle2, Send, Sun, Moon
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import PlasmaSphere from './PlasmaSphere';

interface LayoutProps {
  children: React.ReactNode;
}

const NotificationCenter = () => {
  const { notifications, markNotificationAsRead, clearNotifications } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'SUCCESS': return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'WARNING': return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'ERROR': return { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' };
      default: return { icon: Info, color: 'text-indigo-500', bg: 'bg-indigo-500/10' };
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-[var(--border-subtle)] transition-all group"
      >
        <Bell className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-[var(--bg-card)]"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-3 w-80 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-xl z-40 overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-main)]/50">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <button onClick={clearNotifications} className="text-[10px] font-bold text-[var(--text-muted)] hover:text-rose-500 uppercase tracking-widest">Effacer</button>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-muted)] text-xs italic">Aucune notification.</div>
              ) : (
                notifications.map((n) => {
                  const styles = getTypeStyles(n.type);
                  return (
                    <div key={n.id} className={`p-4 flex gap-3 hover:bg-[var(--bg-main)] transition-all border-b border-[var(--border-subtle)] last:border-0 relative group ${!n.isRead ? 'bg-[var(--accent)]/5' : ''}`}>
                      <div className={`shrink-0 w-8 h-8 rounded-lg ${styles.bg} flex items-center justify-center`}>
                        <styles.icon className={`w-4 h-4 ${styles.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-semibold truncate">{n.title}</h4>
                          <span className="text-[9px] text-[var(--text-muted)]">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">{n.message}</p>
                      </div>
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
  const { exportWorkspace, importWorkspace, resetWorkspace, settings, suppliers, theme, toggleTheme } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePage = location.pathname;

  const menuItems = [
    { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/suppliers', label: 'Fournisseurs', icon: Users },
    { id: '/compliance', label: 'Documents', icon: ShieldCheck },
    { id: '/campaigns', label: 'Campagnes', icon: Send },
    { id: '/analytics', label: 'Analyses', icon: BarChart3 },
    { id: '/settings', label: 'Paramètres', icon: Settings },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importWorkspace(file);
  };

  return (
    <div className={`flex h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-sans transition-colors duration-300`}>
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".json" />

      {/* Modern Compact Sidebar */}
      <aside className="w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col z-20 shrink-0 transition-colors duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden">
            <img src="https://raw.githubusercontent.com/M00N69/RAPPELCONSO/main/logo%2004%20copie.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-bold tracking-tight">VISITrack</span>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${activePage === item.id || (activePage === '/' && item.id === '/dashboard')
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-main)] hover:text-[var(--text-primary)]'
                }`}
            >
              <item.icon className={`w-4 h-4 ${activePage === item.id || (activePage === '/' && item.id === '/dashboard') ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                }`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-6 py-8 flex flex-col items-center justify-center relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <PlasmaSphere className="w-32 h-32 cursor-pointer active:scale-95 transition-transform" />
          <div className="mt-4 text-center">
            <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">Core Engine Active</span>
          </div>
          <div className="absolute bottom-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[var(--border-subtle)] to-transparent" />
        </div>

        <div className="p-4 mt-auto border-t border-[var(--border-subtle)] space-y-2">
          <button onClick={exportWorkspace} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-[var(--bg-main)] rounded-lg transition-all text-[var(--text-secondary)]">
            <Download className="w-3.5 h-3.5" /> Exporter Pack
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-[var(--bg-main)] rounded-lg transition-all text-[var(--text-secondary)]">
            <Upload className="w-3.5 h-3.5" /> Importer Pack
          </button>
          <button onClick={resetWorkspace} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all text-[var(--text-muted)]">
            <Trash2 className="w-3.5 h-3.5" /> Réinitialiser
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 px-8 flex justify-between items-center bg-[var(--bg-card)] border-b border-[var(--border-subtle)] z-10">
          <div className="text-sm font-semibold capitalize">
            {menuItems.find(i => i.id === activePage)?.label || 'Dashboard'}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--border-subtle)] transition-all text-[var(--text-secondary)]"
              title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="w-px h-6 bg-[var(--border-subtle)]" />

            <NotificationCenter />

            <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-xs uppercase shadow-lg shadow-indigo-500/20">
              {settings.companyName.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 scroll-smooth scrollbar-hide">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;