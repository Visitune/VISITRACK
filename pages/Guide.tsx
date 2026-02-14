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
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-indigo-100">
                    <LifeBuoy className="w-4 h-4" /> Documentation Officielle • v7.2
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
                    Pilotage de la <span className="text-indigo-600">Conformité Fournisseur.</span>
                </h1>
                <p className="text-slate-500 max-w-3xl mx-auto text-lg font-medium leading-relaxed">
                    VISITrack centralise la gestion de vos partenaires industriels.
                    De l'analyse automatique des certificats à la traçabilité des matières premières,
                    maîtrisez chaque étape de votre chaîne d'approvisionnement.
                </p>
            </div>

            {/* Core Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {modules.map((m, i) => (
                    <div key={i} className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
                        <div className="flex items-start gap-6">
                            <div className={`p-4 bg-${m.color}-50 rounded-xl text-${m.color}-600 group-hover:bg-${m.color}-600 group-hover:text-white transition-all duration-300 shadow-sm`}>
                                <m.icon className="w-8 h-8" />
                            </div>
                            <div className="space-y-4 flex-1">
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{m.title}</h3>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed border-l-2 border-slate-100 pl-4">
                                    {m.desc}
                                </p>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {m.features.map(f => (
                                        <span key={f} className="bg-slate-50 text-slate-500 border border-slate-100 py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest group-hover:border-indigo-100 transition-colors">
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
            <div className="bg-slate-900 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <Layers className="w-96 h-96 -mr-20 -mt-20 text-indigo-500" />
                </div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ring-white/20">
                            <Terminal className="w-3 h-3" /> Architecture Sécurisée
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                            Souveraineté des Données <br /> & Performance Locale
                        </h2>
                        <div className="space-y-6">
                            <div className="flex gap-6 group">
                                <div className="w-12 h-12 shrink-0 bg-white/5 rounded-xl flex items-center justify-center font-black text-indigo-400 border border-white/10 group-hover:bg-indigo-500 group-hover:text-white transition-all">1</div>
                                <div>
                                    <h4 className="text-white font-bold text-sm mb-1">Local Storage Chiffré</h4>
                                    <p className="text-slate-400 text-xs font-medium leading-relaxed">
                                        Vos données sensibles restent dans votre navigateur. Aucune donnée critique ne transite par des serveurs tiers non maîtrisés.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-6 group">
                                <div className="w-12 h-12 shrink-0 bg-white/5 rounded-xl flex items-center justify-center font-black text-indigo-400 border border-white/10 group-hover:bg-indigo-500 group-hover:text-white transition-all">2</div>
                                <div>
                                    <h4 className="text-white font-bold text-sm mb-1">Sauvegardes JSON</h4>
                                    <p className="text-slate-400 text-xs font-medium leading-relaxed">
                                        Exportez l'intégralité de votre base (fournisseurs, fichiers, contacts) en un clic via le format JSON universel pour l'archivage.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-6 group">
                                <div className="w-12 h-12 shrink-0 bg-white/5 rounded-xl flex items-center justify-center font-black text-indigo-400 border border-white/10 group-hover:bg-indigo-500 group-hover:text-white transition-all">3</div>
                                <div>
                                    <h4 className="text-white font-bold text-sm mb-1">Portabilité Totale</h4>
                                    <p className="text-slate-400 text-xs font-medium leading-relaxed">
                                        Restaurez votre environnement de travail sur n'importe quel poste sécurisé instantanément, sans installation complexe.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10 space-y-6 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-white">FAQ Technique</h4>
                        </div>
                        <div className="space-y-4 divide-y divide-white/5">
                            <div className="pt-4 first:pt-0">
                                <p className="font-bold text-sm mb-2 text-indigo-200">Comment fonctionne l'IA Gemini ?</p>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Le navigateur envoie uniquement le texte extrait des PDF à l'API Google sécurisée. Les fichiers originaux ne sont pas stockés par Google pour l'entraînement (selon configuration Enterprise).
                                </p>
                            </div>
                            <div className="pt-4">
                                <p className="font-bold text-sm mb-2 text-indigo-200">Limites de stockage ?</p>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Le stockage local dépend de votre navigateur (généralement 5-10 Mo pour le LocalStorage, plus pour IndexedDB). Pour les gros volumes, privilégiez l'export régulier.
                                </p>
                            </div>
                        </div>
                        <div className="pt-6 mt-4 border-t border-white/10">
                            <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">
                                Consulter la documentation technique
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="flex flex-col items-center gap-8 py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex flex-col items-center text-center gap-2">
                    <Globe className="w-10 h-10 text-indigo-600 mb-2" />
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Prêt à optimiser vos audits ?</h3>
                    <p className="text-slate-500 text-sm font-medium max-w-md">
                        Rejoignez les équipes Qualité qui ont réduit leur temps de gestion administrative de 40%.
                    </p>
                </div>
                <button className="px-10 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black hover:scale-105 transition-all flex items-center gap-3">
                    Accéder au Dashboard <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default GuidePage;
