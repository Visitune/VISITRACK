# 🚀 Instructions de Déploiement GitHub + Vercel

## Étape 1 : Créer le Repository GitHub

1. Allez sur https://github.com/new
2. Nom du repository : `VISITrack` ou `visitrack-enterprise`
3. Description : "Plateforme de gestion de conformité fournisseurs - Enterprise v7"
4. Visibilité : **Private** (recommandé) ou Public
5. **NE PAS** cocher "Add a README file"
6. Cliquez sur "Create repository"

## Étape 2 : Connecter le Repository Local

Remplacez `VOTRE-USERNAME` par votre nom d'utilisateur GitHub, puis exécutez :

```bash
git remote add origin https://github.com/VOTRE-USERNAME/VISITrack.git
git branch -M main
git push -u origin main
```

**Exemple concret :**
```bash
git remote add origin https://github.com/mmahj/VISITrack.git
git branch -M main
git push -u origin main
```

## Étape 3 : Déployer sur Vercel

### Option A : Via l'Interface Web (Recommandé)

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Add New Project"**
3. Importez votre repository GitHub `VISITrack`
4. Vercel détecte automatiquement Vite
5. Cliquez sur **"Deploy"**
6. ✅ Votre app sera en ligne en ~2 minutes !

### Option B : Via CLI

```bash
npm install -g vercel
vercel login
vercel
```

## 🎯 Configuration Vercel (Automatique)

Vercel détecte automatiquement :
- **Framework** : Vite
- **Build Command** : `npm run build`
- **Output Directory** : `dist`
- **Install Command** : `npm install`

Aucune configuration manuelle nécessaire !

## 🔗 Après le Déploiement

Vous recevrez une URL comme :
- `https://visitrack.vercel.app`
- `https://visitrack-votre-username.vercel.app`

### Domaine Personnalisé (Optionnel)

Dans Vercel > Settings > Domains, vous pouvez ajouter :
- `visitrack.votreentreprise.com`

## 📝 Mises à Jour Futures

Pour mettre à jour l'application :

```bash
# 1. Faites vos modifications
# 2. Committez
git add .
git commit -m "Description des changements"

# 3. Poussez
git push

# 4. Vercel redéploie automatiquement !
```

## ⚡ Variables d'Environnement (Si Nécessaire)

Si vous ajoutez des secrets plus tard :
1. Vercel > Settings > Environment Variables
2. Ajoutez vos clés (ex: API keys serveur)

**Note** : Les clés Gemini sont stockées côté client, pas besoin de les mettre dans Vercel.

## 🆘 Troubleshooting

### Erreur "Permission denied"
```bash
# Configurez votre identité Git
git config --global user.name "Votre Nom"
git config --global user.email "votre@email.com"
```

### Erreur "Repository not found"
Vérifiez que l'URL du remote est correcte :
```bash
git remote -v
```

---

**Prêt à déployer VISITrack Enterprise v7 ! 🚀**
