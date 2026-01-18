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
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Moteur d'Analyse IA</h1>
          <p className="text-slate-500 mt-2">Extraire et valider automatiquement les certificats.</p>
        </div>
        <button onClick={loadExample} className="text-sm text-brand-600 hover:text-brand-700 font-medium bg-brand-50 px-4 py-2 rounded-lg">
          Charger un exemple
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        {/* Input Zone */}
        <div className="flex flex-col gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
            <label className="text-sm font-bold text-slate-700 mb-2">Contenu du Document (OCR)</label>
            <div className="relative flex-1">
              <textarea
                className="w-full h-full p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none font-mono text-sm leading-relaxed"
                placeholder="Collez ici le texte extrait du PDF..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <select 
                  className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 shadow-sm focus:ring-2 focus:ring-brand-500 outline-none"
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
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  Analyser
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Result Zone */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex items-center justify-center relative overflow-hidden">
          {!result ? (
            <div className="text-center text-slate-400">
              <UploadCloud size={48} className="mx-auto mb-4 opacity-50" />
              <p>Les résultats de l'analyse s'afficheront ici.</p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={`p-4 rounded-xl border-l-4 ${result.isValid ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-rose-50 border-rose-500 text-rose-800'} shadow-sm bg-white`}>
                <div className="flex items-center gap-3">
                  {result.isValid ? <CheckCircle size={24} /> : <AlertOctagon size={24} />}
                  <div>
                    <h3 className="font-bold text-lg">{result.isValid ? 'Document Conforme' : 'Attention Requise'}</h3>
                    <p className="text-sm opacity-90">{result.riskAssessment}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 flex-1">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date d'expiration</label>
                  <p className="text-xl font-mono font-bold text-slate-800 mt-1">{result.extractedDate || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Organisme Émetteur</label>
                  <p className="text-lg font-medium text-slate-800 mt-1">{result.issuer || 'Inconnu'}</p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-sm font-medium text-slate-500">Confiance IA</span>
                     <span className="text-sm font-bold text-brand-600">{Math.round(result.confidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-brand-500 h-2 rounded-full transition-all duration-1000" 
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