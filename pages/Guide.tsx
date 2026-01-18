import React from 'react';
import {
    BookOpen, ShieldCheck, Zap, Database, Globe, ArrowRight,
    Award, FileSearch, Send, Layers, MessageSquare, Download,
    CheckCircle2, AlertTriangle, LifeBuoy, Terminal, FileSpreadsheet,
    Rocket, ExternalLink
} from 'lucide-react';

const GuidePage: React.FC = () => {
    const modules = [
        {
            title: "Dossier Industriel 360°",
            icon: Database,
            color: "indigo",
            desc: "Gestion granulaire des partenaires : coordonnées bancaires (IBAN/BIC), fiscalité (SIRET/TVA), données de production et contacts de secours.",
            features: ["Multi-contacts par site", "Données financières", "Géolocalisation du siège"]
        },
        {
            title: "Moteur de GED & Archives",
            icon: ShieldCheck,
            color: "emerald",
            desc: "Uploadez tout type de fichier (PDF, Photos d'audit, Tableaux Excel) directement dans le dossier fournisseur. Les données sont compressées localement.",
            features: ["Upload illimité", "Compression par lot", "Historique horodaté"]
        },
        {
            title: "Analyse OCR Gemini v1.5",
            icon: Zap,
            color: "amber",
            desc: "L'intelligence artificielle analyse vos certificats IFS/BRC. Elle extrait les dates, les scores et suggère un statut de conformité sans intervention humaine.",
            features: ["Extraction de dates", "Calcul de confiance", "Alerte de péremption"]
        },
        {
            title: "Campagnes de Collecte",
            icon: Send,
            color: "rose",
            desc: "Automatisez la relance de vos fournisseurs. Créez des campagnes massives pour récolter des documents manquants avec suivi du taux de réponse.",
            features: ["Emails de masse", "Dashboards live", "Relance automatique"]
        },
        {
            title: "Import de Masse Excel",
            icon: FileSpreadsheet,
            color: "indigo",
            desc: "Onboardez des centaines de fournisseurs en quelques secondes. VISITrack mappe automatiquement vos colonnes Excel vers le dossier industriel.",
            features: ["Parsing .xlsx & .csv", "Mapping intelligent", "Dédoublonnage"]
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-16 animate-fade-in pb-20">
            {/* Hero Section */}
            <div className="text-center space-y-6 pt-10">
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                    <LifeBuoy className="w-4 h-4" /> VISITrack Enterprise v7 • Documentation Officielle
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter">
                    Maîtrisez votre <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent italic">Compliance.</span>
                </h1>
                <p className="text-slate-500 max-w-3xl mx-auto text-lg font-medium leading-relaxed">
                    VISITrack est votre centre de commande pour la conformité technique et industrielle.
                    Structurez vos audits, automatisez vos relances et sécurisez vos données PDM au même endroit.
                </p>
            </div>

            {/* Core Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {modules.map((m, i) => (
                    <div key={i} className="group bg-white p-10 rounded-[44px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all duration-500">
                        <div className="flex items-start gap-8">
                            <div className={`p-6 bg-indigo-50 rounded-3xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner`}>
                                <m.icon className="w-8 h-8" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{m.title}</h3>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                    {m.desc}
                                </p>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {m.features.map(f => (
                                        <span key={f} className="bg-slate-50 text-slate-400 py-1 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest">{f}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Vercel Deployment Section */}
            <div className="bg-indigo-600 rounded-[56px] p-16 text-white relative overflow-hidden shadow-2xl">
                <Rocket className="absolute -right-20 -bottom-20 w-80 h-80 text-white/10 rotate-12" />
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest mb-6">
                        <ExternalLink className="w-3 h-3" /> Quick Deploy
                    </div>
                    <h2 className="text-4xl font-black tracking-tight mb-6">Déployez VISITrack sur Vercel</h2>
                    <p className="text-indigo-100 text-lg mb-8 font-medium leading-relaxed">
                        Transformez VISITrack en votre application SaaS personnelle en 2 minutes. Vos utilisateurs pourront gérer leurs propres fournisseurs en toute autonomie.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-black/10 p-4 rounded-2xl border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center font-black text-xs">1</div>
                            <p className="text-sm font-bold">Connectez votre repo GitHub à Vercel.</p>
                        </div>
                        <div className="flex items-center gap-4 bg-black/10 p-4 rounded-2xl border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center font-black text-xs">2</div>
                            <p className="text-sm font-bold">L'application est détectée comme un projet Vite.</p>
                        </div>
                        <div className="flex items-center gap-4 bg-black/10 p-4 rounded-2xl border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-white text-indigo-600 flex items-center justify-center font-black text-xs">3</div>
                            <p className="text-sm font-bold">Chaque collaborateur travaille dans son propre bac à sable local.</p>
                        </div>
                    </div>
                    <button className="mt-10 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-all">
                        Consulter le guide de déploiement
                    </button>
                </div>
            </div>

            {/* Technical Workflow Section */}
            <div className="bg-slate-900 rounded-[56px] p-16 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-16 opacity-10">
                    <Layers className="w-96 h-96 -mr-32 -mt-32" />
                </div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest ring-1 ring-white/20">
                            <Terminal className="w-3 h-3" /> Architecture Zero-Server
                        </div>
                        <h2 className="text-4xl font-black tracking-tight">Sécurité des Données <br /> & Sauvegardes</h2>
                        <div className="space-y-6">
                            <div className="flex gap-6">
                                <div className="w-12 h-12 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center font-black text-indigo-400">1</div>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    <strong className="text-white">Local Storage (Persistance) :</strong> Vos dossiers fournisseurs sont stockés dans votre navigateur. Aucune donnée n'est envoyée dans le cloud VISITrack.
                                </p>
                            </div>
                            <div className="flex gap-6">
                                <div className="w-12 h-12 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center font-black text-indigo-400">2</div>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    <strong className="text-white">Export de Package :</strong> Utilisez régulièrement le bouton <span className="text-white italic">"Sauvegarder Pack"</span> en bas de la barre latérale pour générer un fichier JSON de sauvegarde complète.
                                </p>
                            </div>
                            <div className="flex gap-6">
                                <div className="w-12 h-12 shrink-0 bg-white/10 rounded-2xl flex items-center justify-center font-black text-indigo-400">3</div>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    <strong className="text-white">Restauration :</strong> Importez votre package JSON sur n'importe quel poste pour retrouver instantanément vos fournisseurs et documents.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-[40px] p-10 border border-white/10 space-y-8">
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400">FAQ Expert</h4>
                        <div className="space-y-6">
                            <div className="group cursor-help">
                                <p className="font-bold text-sm mb-2 group-hover:text-indigo-400 transition-colors">Ma clé API Gemini est-elle sécurisée ?</p>
                                <p className="text-xs text-slate-500 leading-relaxed">Oui, elle est stockée localement. Nous ne la voyons jamais. Elle n'est utilisée que par votre navigateur pour appeler Google.</p>
                            </div>
                            <div className="group cursor-help">
                                <p className="font-bold text-sm mb-2 group-hover:text-indigo-400 transition-colors">Puis-je uploader des vidéos usine ?</p>
                                <p className="text-xs text-slate-500 leading-relaxed">C'est possible via l'onglet GED, mais attention : la limite de stockage du navigateur est d'environ 5-10 Mo selon l'OS. Privilégiez les photos compressées.</p>
                            </div>
                            <div className="group cursor-help border-t border-white/5 pt-6">
                                <button className="flex items-center gap-3 text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:gap-5 transition-all">
                                    Contacter le Support Technique <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="flex flex-col items-center gap-8 py-10">
                <div className="flex gap-4">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-12 h-12 rounded-full border-4 border-[#F8F9FC] bg-slate-200 flex items-center justify-center text-xs font-black text-slate-400 uppercase">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-black text-slate-900 uppercase">Utilisé par vos équipes Qualité</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Plus de 1500 dossiers déjà certifiés</p>
                    </div>
                </div>
                <button className="px-12 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-indigo-100 hover:scale-105 transition-all">
                    Prêt à valider votre prochain fournisseur ?
                </button>
            </div>
        </div>
    );
};

export default GuidePage;
