import React, { useState, useEffect } from 'react';
import {
    X, Sparkles, ShieldCheck, Zap,
    Database, Send, ArrowRight, CheckCircle2
} from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const WelcomeModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        if (dontShowAgain) {
            localStorage.setItem('visitrack_welcome_hidden', 'true');
        }
        onClose();
    };

    const features = [
        {
            icon: Zap,
            title: "Analyse IA Gemini",
            desc: "Analyse automatique de vos certificats IFS/BRC avec détection des scores et validités.",
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            icon: ShieldCheck,
            title: "Conformité 360°",
            desc: "Suivi en temps réel des questionnaires, attestations et engagements fournisseurs.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            icon: Database,
            title: "Dossier Industriel",
            desc: "Centralisation des fiches techniques, contacts et périmètres de matières premières.",
            color: "text-indigo-500",
            bg: "bg-indigo-500/10"
        },
        {
            icon: Send,
            title: "Campagnes de Collecte",
            desc: "Automatisez vos relances documentaires pour maintenir votre base à jour sans effort.",
            color: "text-rose-500",
            bg: "bg-rose-500/10"
        }
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-[var(--bg-card)] w-full max-w-2xl rounded-2xl border border-[var(--border-subtle)] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                {/* Left Side: Branding/Visual */}
                <div className="md:w-5/12 bg-gradient-to-br from-[#1A1D2E] to-[#13162A] p-8 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[var(--accent)] rounded-full blur-3xl" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-500 rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 mb-6">
                            <Sparkles className="w-6 h-6 text-[var(--accent)]" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter leading-tight mb-4">
                            Bienvenue sur <span className="text-[var(--accent)]">VISITrack</span>
                        </h2>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed uppercase tracking-wide">
                            Optimisez le pilotage de votre conformité fournisseur avec l'Intelligence Artificielle.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Dernières mises à jour
                            <div className="h-px flex-1 bg-slate-800" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[10px] text-slate-300 font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Analyses de risques paramétrables
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-300 font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Nouvelle vue dezoomée v8.1
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Features & Action */}
                <div className="md:w-7/12 p-8 flex flex-col bg-[var(--bg-card)]">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Guide de démarrage rapide</h3>
                        <button onClick={handleClose} className="p-1 hover:bg-[var(--bg-main)] rounded-full transition-colors">
                            <X className="w-5 h-5 text-[var(--text-muted)]" />
                        </button>
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto pr-2 no-scrollbar">
                        {features.map((f, i) => (
                            <div key={i} className="flex gap-4 group">
                                <div className={`w-10 h-10 shrink-0 rounded-lg ${f.bg} flex items-center justify-center ${f.color} transition-transform group-hover:scale-110`}>
                                    <f.icon className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">{f.title}</h4>
                                    <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">
                                        {f.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] space-y-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="dontShow"
                                checked={dontShowAgain}
                                onChange={(e) => setDontShowAgain(e.target.checked)}
                                className="w-4 h-4 rounded border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--accent)] focus:ring-[var(--accent)]"
                            />
                            <label htmlFor="dontShow" className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] cursor-pointer">
                                Ne plus afficher au démarrage
                            </label>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-full py-4 bg-[var(--accent)] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                        >
                            Démarrer maintenant <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
