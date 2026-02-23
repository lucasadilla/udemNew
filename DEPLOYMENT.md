# Déploiement sur Vercel

## 1. Vérifier le build en local

```bash
npm run build
```

Corriger toute erreur avant de déployer.

## 2. Variables d’environnement sur Vercel

Dans le projet Vercel : **Settings → Environment Variables**. Ajouter :

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | Oui | URL PostgreSQL de production (ex. Supabase, Neon). Avec Supabase pooler : ajouter `?pgbouncer=true` |
| `NEXTAUTH_SECRET` | Oui | Secret pour les sessions (générer avec `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Oui | URL du site en prod, ex. `https://votre-projet.vercel.app` |
| `CLOUDINARY_API_KEY` | Oui | Pour les uploads d’images |
| `CLOUDINARY_API_SECRET` | Oui | Pour les uploads d’images |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Oui | Nom du cloud Cloudinary |
| `RESEND_API_KEY` | Oui (contact) | Clé API Resend pour le formulaire de contact |

Optionnel :

- `CONTACT_EMAIL` – adresse qui reçoit les messages (défaut : femmesetdroit.udem@gmail.com)
- `CONTACT_FROM_EMAIL` – adresse expéditrice affichée (défaut : onboarding@resend.dev)

## 3. Base de données

- Créer une base PostgreSQL en production (ex. Supabase, Neon).
- Mettre `DATABASE_URL` dans Vercel (voir ci‑dessus).
- Appliquer le schéma une fois (en local avec l’URL de prod, ou via un script) :

```bash
DATABASE_URL="votre_url_production" npx prisma db push
```

- Créer ou réinitialiser un admin si besoin :

```bash
DATABASE_URL="votre_url_production" node prisma/reset-admin.js
```

## 4. Déployer

- Lier le repo GitHub/GitLab/Bitbucket à Vercel.
- Vercel utilisera `npm run build` (et `postinstall` → `prisma generate`).
- Après le premier déploiement, mettre à jour `NEXTAUTH_URL` avec l’URL réelle du projet (ex. domaine personnalisé) et redéployer si besoin.

## 5. Après le déploiement

- Tester la page d’accueil, le blog, les événements, le formulaire de contact, l’admin.
- Vérifier que les images Cloudinary s’affichent (domaine autorisé dans `next.config.ts`).
- Se connecter à l’admin : `/admin/login`.
