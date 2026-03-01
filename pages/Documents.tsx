import React, { useState } from 'react';
import { Sparkles, FileText, ArrowRight, CheckCircle, AlertOctagon, Loader2, UploadCloud } from 'lucide-react';
import { analyzeDocument } from '../services/gemini';
import { AnalysisResult } from '../types';

const Documents = () => {
  const [text, setText] = useState('');
  const [type, setType] = useState('Certificat BIO');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const data = await analyzeDocument(text, type);
      setResult(data);
    } catch (e) {
      alert("Erreur d'analyse. Vérifiez votre clé API.");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setText(`CERTIFICAT DE CONFORMITÉ
Organisme: Bureau Veritas
N° Certificat: FR-2024-9981

Fournisseur: AGRO ALIM SUD
Produit: Huile d'Olive Extra Vierge

Le présent document atteste que les produits sont conformes au référentiel IFS Food v7.
Niveau: Foundation Level
Score: 94%

Date de début: 01/02/2024
Date d'expiration: 31/01/2025
    
Status: Validé par le directeur technique.`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Moteur d'Analyse IA</h1>
          <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" /> Extraction & Validation Automatisée
          </p>
        </div>
        <button
          onClick={loadExample}
          className="bg-[var(--accent-subtle)] text-[var(--accent)] px-5 py-2.5 rounded-lg font-black hover:opacity-90 transition-all border border-[var(--accent)]/10 uppercase tracking-widest text-[9px]"
        >
          Charger un exemple
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        {/* Input Zone */}
        <div className="flex flex-col gap-4">
          <div className="bg-[var(--bg-card)] p-8 rounded-xl border border-[var(--border-subtle)] shadow-sm flex flex-col h-full relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent)] opacity-20" />
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 flex items-center gap-2">
              <UploadCloud className="w-3.5 h-3.5" /> Contenu du Document (OCR)
            </label>
            <div className="relative flex-1">
              <textarea
                className="w-full h-full p-6 bg-[var(--bg-main)]/50 border border-[var(--border-subtle)] rounded-xl resize-none focus:ring-2 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)]/30 outline-none font-mono text-sm leading-relaxed text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)]/50"
                placeholder="Collez ici le texte extrait du PDF..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="absolute bottom-6 right-6 flex gap-3 items-center">
                <select
                  className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[10px] font-black uppercase tracking-widest px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-[var(--accent)]/10 outline-none text-[var(--text-primary)] appearance-none cursor-pointer hover:border-[var(--accent)]/30 transition-colors"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option>Certificat BIO</option>
                  <option>IFS / BRC</option>
                  <option>Assurance RC</option>
                </select>
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !text}
                  className="bg-[var(--accent)] hover:opacity-90 text-white px-6 py-2.5 rounded-lg font-black shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest text-[10px]"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  {loading ? 'Analyse...' : 'Analyser'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Result Zone */}
        <div className="bg-[var(--bg-main)]/30 border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-8 flex items-center justify-center relative overflow-hidden">
          {!result ? (
            <div className="text-center group">
              <div className="w-20 h-20 bg-[var(--bg-card)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border-subtle)] shadow-inner group-hover:scale-110 transition-transform duration-500">
                <UploadCloud size={32} className="text-[var(--text-muted)] opacity-30" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">En attente de données</p>
              <p className="text-[9px] text-[var(--text-muted)] mt-2 font-medium opacity-60">Les résultats de l'analyse s'afficheront ici.</p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col gap-6 animate-fade-in">
              <div className={`p-6 rounded-xl border border-[var(--border-subtle)] ${result.isValid ? 'bg-emerald-500/5 text-emerald-500' : 'bg-rose-500/5 text-rose-500'} shadow-sm relative overflow-hidden`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${result.isValid ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${result.isValid ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                    {result.isValid ? <CheckCircle size={24} /> : <AlertOctagon size={24} />}
                  </div>
                  <div>
                    <h3 className="font-black text-lg uppercase tracking-tight">{result.isValid ? 'Document Conforme' : 'Attention Requise'}</h3>
                    <p className="text-[11px] font-medium opacity-80 mt-1">{result.riskAssessment}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--bg-card)] rounded-xl shadow-sm border border-[var(--border-subtle)] p-8 space-y-8 flex-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="w-16 h-16 bg-[var(--bg-main)] rounded-full flex items-center justify-center border border-[var(--border-subtle)] shadow-inner">
                    <FileText className="w-6 h-6 text-[var(--text-muted)] opacity-20" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] block mb-2">Date d'expiration</label>
                    <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight font-mono">{result.extractedDate || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] block mb-2">Confiance IA</label>
                    <p className={`text-2xl font-black tracking-tight font-mono ${result.confidence > 0.8 ? 'text-emerald-500' : 'text-amber-500'}`}>{Math.round(result.confidence * 100)}%</p>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] block mb-2">Organisme Émetteur</label>
                  <p className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-tight">{result.issuer || 'Inconnu'}</p>
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Indice de fiabilité</span>
                    <span className="text-[10px] font-bold text-[var(--accent)] font-mono">{Math.round(result.confidence * 100)}/100</span>
                  </div>
                  <div className="w-full bg-[var(--bg-main)] rounded-full h-1.5 overflow-hidden shadow-inner">
                    <div
                      className="bg-[var(--accent)] h-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,107,0,0.5)]"
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;