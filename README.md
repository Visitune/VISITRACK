# VISITrack Enterprise v7

## 🚀 Plateforme de Gestion de Conformité Fournisseurs

VISITrack est une application web moderne pour la gestion centralisée de vos dossiers fournisseurs, la conformité documentaire et le suivi PDM (Product Data Management).

### ✨ Fonctionnalités Principales

- **📁 Dossiers Industriels 360°** : Gestion granulaire des coordonnées bancaires, fiscales et de production
- **🤖 Analyse AI Gemini** : Extraction automatique de données depuis certificats IFS/BRC
- **📊 Import de Masse Excel** : Onboarding rapide via fichiers .xlsx/.csv
- **💾 GED Intégrée** : Upload et archivage de fichiers (PDFs, photos d'audit) avec persistance Base64
- **📧 Campagnes Automatisées** : Relances massives pour collecte de documents
- **🔒 100% Client-Side** : Aucune donnée n'est envoyée à un serveur externe

### 🛠️ Stack Technique

- **Frontend** : React 18 + TypeScript
- **Build** : Vite 6
- **UI** : Tailwind CSS + Lucide Icons
- **Charts** : Recharts
- **Excel** : SheetJS (xlsx)
- **AI** : Google Gemini API

### 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/VISITrack.git
cd VISITrack

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build de production
npm run build
```

### 🚀 Déploiement Vercel

1. Connectez votre repository GitHub à Vercel
2. Vercel détecte automatiquement le projet Vite
3. Déployez en un clic !

### 🔑 Configuration

L'application nécessite une clé API Google Gemini pour l'analyse de documents :
1. Obtenez une clé sur [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Configurez-la dans Paramètres > Clé API Gemini

**Note** : La clé est stockée localement dans votre navigateur et n'est jamais transmise à nos serveurs.

### 📚 Documentation

Consultez le **Guide Utilisateur** intégré dans l'application pour :
- Comprendre le système de packages
- Utiliser l'import Excel
- Gérer la GED
- Déployer sur Vercel

### 🔐 Sécurité & Données

- **Stockage Local** : Toutes vos données restent dans votre navigateur (localStorage)
- **Export/Import** : Sauvegardez vos packages JSON pour backup ou migration
- **Aucun Serveur** : Architecture 100% client-side

### 📊 Limites Techniques

- **Stockage** : ~5-10 MB selon le navigateur
- **Fichiers GED** : Limite recommandée de 2 MB par fichier
- **Solution** : Export régulier des packages pour archivage

### 🤝 Contribution

Ce projet est développé pour un usage professionnel en environnement industriel.

### 📄 Licence

Propriétaire - Tous droits réservés

### 🆘 Support

Pour toute question ou assistance, consultez le guide intégré ou contactez l'équipe VISITrack.

---

**VISITrack Enterprise v7** - Votre centre de commande pour la conformité fournisseurs 🎯
