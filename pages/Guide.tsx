import React from 'react';
import {
    ShieldCheck, Zap, Database, Send,
    FileSpreadsheet, LifeBuoy, Terminal, Layers,
    ArrowRight, Sparkles, Box, FileText, Globe
} from 'lucide-react';

const GuidePage: React.FC = () => {
    const modules = [
        {
            title: "Dossier Industriel 360°",
            icon: Database,
            color: "indigo",
            desc: "Centralisation complète des données partenaires. Gérez les informations critiques : coordonnées bancaires (IBAN/BIC), données fiscales (SIRET/TVA), capacités de production et contacts d'urgence. Une vue unifiée pour sécuriser votre référentiel fournisseur.",
            features: ["Structure Multi-sites", "Conformité Financière", "Traçabilité des Contacts"]
        },
        {
            title: "Moteur de GED & Archives",
            icon: ShieldCheck,
            color: "emerald",
            desc: "Système de Gestion Électronique de Documents intégré. Archivez certificats, rapports d'audit, et spécifications techniques directement dans le dossier fournisseur. Support du glisser-déposer et prévisualisation instantanée.",
            features: ["Stockage Sécurisé", "Formats Universels", "Historique de Version"]
        },
        {
            title: "Analyse IA Gemini",
            icon: Zap,
            color: "amber",
            desc: "L'intelligence artificielle Google Gemini analyse vos certificats GFSI (IFS, BRC, FSSC). Elle détecte automatiquement les dates de validité, les scores d'audit et les périmètres de certification pour alerter sur les non-conformités.",
            features: ["OCR Intelligent", "Détection des Scopes", "Alertes Prédictives"]
        },
        {
            title: "Campagnes de Collecte",
            icon: Send,
            color: "rose",
            desc: "Automatisez les campagnes de mise à jour documentaire. Ciblez des groupes de fournisseurs pour réclamer les pièces manquantes ou échues. Suivez le taux de réponse en temps réel via des tableaux de bord dynamiques.",
            features: ["Relances Automatisées", "Tracking des Emails", "Workflow de Validation"]
        },
        {
            title: "Import de Masse & API",
            icon: FileSpreadsheet,
            color: "indigo",
            desc: "Accélérez l'onboarding fournisseur grâce à l'import Excel/CSV intelligent. Le système mappe automatiquement vos colonnes pour créer des centaines de dossiers en quelques secondes, sans saisie manuelle.",
            features: ["Mapping Auto-apprenant", "Détection de Doublons", "Rapports d'Intégration"]
        },
        {
            title: "Catalogue PDM",
            icon: Box,
            color: "cyan",
            desc: "Product Data Management simplifié. Liez les matières premières aux fournisseurs, gérez les versions des fiches techniques et suivez les origines géographiques des ingrédients pour une traçabilité totale.",
            features: ["Versionning Recettes", "Origines & Labels", "Lien Fournisseur-Article"]
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
            {/* Hero Section */}
            <div className="text-center space-y-6 pt-10">
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--accent-subtle)] text-[var(--accent)] rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-[var(--accent)]/10">
                    <LifeBuoy className="w-4 h-4" /> Documentation Officielle • v7.2
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-[var(--text-primary)] tracking-tighter">
                    Pilotage de la <span className="text-[var(--accent)]">Conformité Fournisseur.</span>
                </h1>
                <p className="text-[var(--text-muted)] max-w-3xl mx-auto text-lg font-bold uppercase tracking-tight leading-relaxed opacity-80">
                    VISITrack centralise la gestion de vos partenaires industriels.
                    Maîtrisez chaque étape de votre chaîne d'approvisionnement avec précision.
                </p>
            </div>

            {/* Core Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {modules.map((m, i) => (
                    <div key={i} className="group bg-[var(--bg-card)] p-10 rounded-xl border border-[var(--border-subtle)] shadow-sm hover:border-[var(--accent)]/30 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                        <div className="flex items-start gap-8 relative z-10">
                            <div className={`p-5 bg-[var(--bg-main)] rounded-xl text-[var(--accent)] border border-[var(--border-subtle)] group-hover:bg-[var(--accent)] group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-sm`}>
                                <m.icon className="w-8 h-8" />
                            </div>
                            <div className="space-y-4 flex-1">
                                <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">{m.title}</h3>
                                <p className="text-[13px] text-[var(--text-secondary)] font-medium leading-relaxed border-l-2 border-[var(--border-subtle)] pl-5 group-hover:border-[var(--accent)] transition-colors">
                                    {m.desc}
                                </p>
                                <div className="flex flex-wrap gap-2 pt-4">
                                    {m.features.map(f => (
                                        <span key={f} className="bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-subtle)] py-1.5 px-3 rounded text-[9px] font-black uppercase tracking-widest group-hover:border-[var(--accent)]/20 transition-colors">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Technical Workflow Section */}
            <div className="bg-slate-900 rounded-xl p-16 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <Layers className="w-96 h-96 -mr-20 -mt-20 text-indigo-500" />
                </div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ring-white/20">
                            <Terminal className="w-3 h-3" /> Architecture Sécurisée
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
                            Souveraineté des Données <br /> <span className="text-indigo-400">& Performance Locale</span>
                        </h2>
                        <div className="space-y-8">
                            <div className="flex gap-8 group">
                                <div className="w-14 h-14 shrink-0 bg-white/5 rounded-xl flex items-center justify-center font-black text-indigo-400 border border-white/10 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg">1</div>
                                <div>
                                    <h4 className="text-white font-black uppercase tracking-widest text-xs mb-2">Local Storage Chiffré</h4>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                        Vos données sensibles restent dans votre navigateur. Aucune donnée critique ne transite par des serveurs tiers.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-8 group">
                                <div className="w-14 h-14 shrink-0 bg-white/5 rounded-xl flex items-center justify-center font-black text-indigo-400 border border-white/10 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg">2</div>
                                <div>
                                    <h4 className="text-white font-black uppercase tracking-widest text-xs mb-2">Sauvegardes JSON</h4>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                        Exportez l'intégralité de votre base en un clic via le format JSON universel pour l'archivage ou le transfert.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-10 border border-white/10 space-y-8 backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-6 h-6 text-amber-400" />
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Focus Sécurité</h4>
                        </div>
                        <div className="space-y-6 divide-y divide-white/10">
                            <div className="pt-6 first:pt-0">
                                <p className="font-black text-sm mb-3 text-indigo-200 uppercase tracking-tight">Comment fonctionne l'IA Gemini ?</p>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                    Le navigateur envoie uniquement le texte extrait des PDF à l'API sécurisée. Les fichiers originaux restent confidentiels.
                                </p>
                            </div>
                            <div className="pt-6">
                                <p className="font-black text-sm mb-3 text-indigo-200 uppercase tracking-tight">Portabilité Totale ?</p>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                    Restaurez votre environnement de travail sur n'importe quel poste sécurisé instantanément, sans installation.
                                </p>
                            </div>
                        </div>
                        <div className="pt-8">
                            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-500/20">
                                Consulter la documentation technique
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="flex flex-col items-center gap-10 py-20 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--accent)]/5" />
                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                    <div className="w-20 h-20 bg-[var(--bg-main)] rounded-full flex items-center justify-center border border-[var(--border-subtle)] shadow-inner mb-4">
                        <Globe className="w-10 h-10 text-[var(--accent)]" />
                    </div>
                    <h3 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tight">Prêt à optimiser vos audits ?</h3>
                    <p className="text-[var(--text-secondary)] text-sm font-bold uppercase tracking-widest max-w-md opacity-60">
                        Rejoignez les équipes Qualité qui pilotent avec VISITrack.
                    </p>
                </div>
                <button className="px-12 py-5 bg-[var(--text-primary)] text-[var(--bg-card)] rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-black hover:scale-105 transition-all flex items-center gap-4 relative z-10">
                    Accéder au Dashboard <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default GuidePage;
