import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Settings as SettingsIcon, Key, Save, RefreshCcw, Building, Globe, ShieldCheck, Database, Link, CheckCircle2 } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const { settings, updateSettings, resetWorkspace } = useWorkspace();
    const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
    const [ifsKey, setIfsKey] = useState(settings.ifsApiKey || '');
    const [brcKey, setBrcKey] = useState(settings.brcApiKey || '');
    const [success, setSuccess] = useState(false);

    const handleSave = () => {
        updateSettings({
            geminiApiKey: apiKey,
            ifsApiKey: ifsKey,
            brcApiKey: brcKey
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Enterprise Configuration</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-2">Gestion des backends, APIs et identité VISITrack</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* AI & CORE API */}
                <div className="bg-white p-10 rounded-[44px] border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-50 rounded-[22px] flex items-center justify-center text-indigo-600 shadow-sm">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase">Moteur IA & Core</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connecteurs Gemini de Google</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Google Gemini API Key</label>
                            <input
                                type="password"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/5 font-mono text-sm font-bold shadow-inner"
                                placeholder="sk-..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                        </div>

                        <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 italic">
                            <p className="text-xs text-slate-500 font-medium">Architecture locale sécurisée : Vos clés sont stockées uniquement dans votre navigateur.</p>
                        </div>
                    </div>
                </div>

                {/* THIRD PARTY API BRIDGES */}
                <div className="bg-white p-10 rounded-[44px] border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-50 rounded-[22px] flex items-center justify-center text-emerald-600 shadow-sm">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase">Base de Données Externes</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Simulation de pont API (IFS/BRC)</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">IFS Progress API</label>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter">Ready for Dev</span>
                            </div>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-emerald-500/5 font-mono text-sm font-bold"
                                placeholder="Clé API Client IFS..."
                                value={ifsKey}
                                onChange={(e) => setIfsKey(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">BRCGS Directory Connector</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-indigo-500/5 font-mono text-sm font-bold"
                                placeholder="Clé API Client BRC..."
                                value={brcKey}
                                onChange={(e) => setBrcKey(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Company Context */}
                <div className="bg-white p-10 rounded-[44px] border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-50 rounded-[22px] flex items-center justify-center text-amber-600 shadow-sm">
                            <Building className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-xl tracking-tight uppercase">Contexte Entreprise</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identité du Workspace</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dénomination Sociale</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none font-bold"
                                value={settings.companyName}
                                onChange={(e) => updateSettings({ companyName: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                            <div className="flex items-center gap-4">
                                <Database className="w-5 h-5 text-indigo-400" />
                                <div>
                                    <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Visi-Sync Engine</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Sauvegarde temps réel activée</p>
                                </div>
                            </div>
                            <button
                                onClick={() => updateSettings({ autoSave: !settings.autoSave })}
                                className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${settings.autoSave ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${settings.autoSave ? 'left-8' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* API Logs / Status Simulation */}
                <div className="bg-slate-900 p-10 rounded-[44px] text-white shadow-2xl space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5"><Link className="w-32 h-32" /></div>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 rounded-[22px] flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-xl tracking-tight uppercase">Statut des Endpoints</h3>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Surveillance des flux externes</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">IFS Directory Connector</span>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Simulée
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Google Gemini-Pro-Vision</span>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Operationnel
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 opacity-50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">BRCGS API Bridge</span>
                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">En attente des clés</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-10">
                <button
                    onClick={handleSave}
                    className="px-12 py-5 bg-indigo-600 text-white font-black rounded-3xl flex items-center justify-center gap-4 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 uppercase tracking-widest text-xs"
                >
                    <Save className="w-5 h-5" /> Enregistrer la Configuration Enterprise
                </button>
            </div>

            {success && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl flex items-center gap-3 animate-slide-up">
                    <CheckCircle2 className="w-5 h-5" /> Configuration appliquée avec succès
                </div>
            )}

            {/* Danger Zone */}
            <div className="bg-rose-50 p-12 rounded-[44px] border border-rose-100">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                    <div>
                        <h3 className="text-rose-900 font-black text-xl uppercase tracking-tight">Zone de Nettoyage</h3>
                        <p className="text-rose-700 text-xs font-bold uppercase tracking-widest mt-2 opacity-60">Réinitialiser le workspace supprimera définitivement vos fournisseurs, campagnes et clés API.</p>
                    </div>
                    <button
                        onClick={resetWorkspace}
                        className="px-10 py-5 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 shadow-2xl shadow-rose-200 transition-all flex items-center gap-3 uppercase tracking-widest text-xs"
                    >
                        <RefreshCcw className="w-5 h-5" /> Flush Workspace Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
