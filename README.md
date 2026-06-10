# 🌴 Palmeraie Dimako — Guide de déploiement

## Fichiers du projet
| Fichier | Rôle | Nécessaire ? |
|---|---|---|
| `index.html` | Le site complet (tout intégré) | ✅ Oui |
| `config.js` | Vos clés Supabase | ✅ Oui |
| `supabase_schema.sql` | Script base de données (une seule fois) | ✅ Une fois |
| `app.js` | ❌ Fichier inutile — déjà intégré dans index.html | Non |
| `style.css` | ❌ Fichier inutile — déjà intégré dans index.html | Non |

---

## ÉTAPE 1 — Base de données Supabase (déjà créée ✅)

Votre projet Supabase est : `https://jefgsitnqzemmvpqsumg.supabase.co`

Si les tables ne sont pas encore créées :
1. Allez sur **https://supabase.com** → votre projet
2. Cliquez **SQL Editor** → **New query**
3. Copiez-collez le contenu de `supabase_schema.sql` → cliquez **Run**
4. Vous devez voir : `Schéma créé avec succès ✓`

### Voir vos données dans Supabase
- **Table Editor** (menu gauche) → sélectionnez `saisies` ou `notes` → vue tableau
- **SQL Editor** → tapez `SELECT * FROM saisies;` pour tout voir
- **Exporter en CSV/Excel** : Table Editor → bouton **Export** (en haut à droite)

---

## ÉTAPE 2 — Mettre en ligne avec GitHub + Netlify

### Sur GitHub
1. Allez sur **https://github.com** → **New repository** → nom : `palmeraie-dimako`
2. Uploadez **seulement 2 fichiers** : `index.html` et `config.js`
3. Cliquez **Commit changes**

### Sur Netlify
4. Allez sur **https://netlify.com** → connectez-vous avec GitHub
5. **Add new site** → **Import from Git** → sélectionnez `palmeraie-dimako`
6. Cliquez **Deploy site** → votre site est en ligne en ~1 minute

---

## Utilisation du site

### Connexion
Chaque employé entre son **prénom** et choisit sa zone :
- 🌴 Zone de production
- 🛒 Boutique Dimako
- 🏪 Boutique Bertoua
- 📓 Bloc-notes (accessible à tous)

### Bloc-notes journalier
- Chaque employé note ses observations du jour
- À la fin du mois → **"Rapport PDF"** génère un PDF de toutes les notes du mois

### Générer un PDF
1. Sélectionner le mois dans la barre de mois
2. Remplir les informations
3. Cliquer **Enregistrer** → données sauvegardées en base
4. Cliquer **Générer PDF** → téléchargement automatique

---

## ❓ Problèmes fréquents

**Données non enregistrées en ligne** → Vérifiez que `config.js` contient les bonnes clés

**URL incorrecte** → L'URL doit être `https://xxx.supabase.co` (SANS `/rest/v1/` à la fin)

**PDF avec mauvaise mise en page** → Vérifiez que vous utilisez la dernière version de `index.html`

---

*Palmeraie Dimako — 2026*
