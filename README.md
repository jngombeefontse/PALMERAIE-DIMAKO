# 🌴 Palmeraie Dimako — Guide de déploiement

## Ce dossier contient 4 fichiers
- `index.html` — le site web
- `style.css` — le design
- `app.js` — la logique
- `config.js` — **vos clés Supabase** (à remplir)
- `supabase_schema.sql` — la base de données (à exécuter une seule fois)

---

## ÉTAPE 1 — Créer votre base de données Supabase (5 min)

1. Allez sur **https://supabase.com** → cliquez **Start your project**
2. Créez un compte gratuit (avec Google ou email)
3. Cliquez **New project** → donnez un nom : `palmeraie-dimako`
4. Choisissez un mot de passe de base → cliquez **Create new project**
5. Attendez ~2 minutes que le projet se crée

### Exécuter le script SQL
6. Dans votre projet Supabase, cliquez **SQL Editor** (icône base de données à gauche)
7. Cliquez **New query**
8. Copiez tout le contenu du fichier `supabase_schema.sql`
9. Collez-le dans l'éditeur → cliquez **Run** (▶)
10. Vous devez voir : `Schema créé avec succès`

### Récupérer vos clés
11. Allez dans **Settings** (roue dentée) → **API**
12. Copiez :
    - **Project URL** → ressemble à `https://abcdefgh.supabase.co`
    - **anon public** (sous "Project API keys")

---

## ÉTAPE 2 — Configurer le site (2 min)

Ouvrez le fichier `config.js` et remplacez les valeurs :

```js
const SUPABASE_URL  = 'https://VOTRE_PROJET.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIs...';  // votre clé anon
```

Sauvegardez le fichier.

---

## ÉTAPE 3 — Mettre en ligne avec GitHub + Netlify (10 min)

### Sur GitHub
1. Allez sur **https://github.com** → connectez-vous
2. Cliquez le **+** en haut à droite → **New repository**
3. Nom : `palmeraie-dimako` → cochez **Public** → cliquez **Create repository**
4. Sur la page du repo, cliquez **uploading an existing file**
5. Glissez-déposez les 4 fichiers : `index.html`, `style.css`, `app.js`, `config.js`
6. Cliquez **Commit changes**

### Sur Netlify
7. Allez sur **https://netlify.com** → **Sign up** (avec GitHub)
8. Cliquez **Add new site** → **Import an existing project** → **GitHub**
9. Sélectionnez votre repo `palmeraie-dimako`
10. Laissez tous les paramètres par défaut → cliquez **Deploy site**
11. Attendez ~1 minute → votre site est en ligne !

Netlify vous donne une adresse du type : `https://palmeraie-dimako.netlify.app`

---

## Comptes de connexion

| Identifiant | Mot de passe | Accès |
|---|---|---|
| admin | admin123 | Tout le site |
| odette | odette123 | Dashboard + Boutique Dimako |
| alain | alain123 | Dashboard + Boutique Bertoua |
| presseur | press123 | Dashboard + Zone de production |

---

## ❓ Problèmes fréquents

**"Configurez config.js"** → Vous n'avez pas encore mis vos clés Supabase dans config.js

**"Erreur de connexion"** → Vérifiez que l'URL et la clé sont correctement copiées (pas d'espace)

**Les données ne s'affichent pas** → Vérifiez que le script SQL a bien été exécuté dans Supabase

---

*Site développé pour la gestion de la Palmeraie Dimako — 2026*
