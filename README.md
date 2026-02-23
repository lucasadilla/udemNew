# Femmes et Droit UdeM – Site éditable

Site style [Femmes et Droit UdeM](https://www.femmesetdroitudem.com/) avec mode édition intégré : l’admin peut se connecter et modifier le contenu (bannière, carrousel, comité, blog, podcast, événements, guide des commanditaires) directement depuis le site.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS**
- **PostgreSQL** + **Prisma**
- **NextAuth** (credentials) pour l’admin
- **TipTap** pour le contenu riche des articles
- **FullCalendar** pour les événements
- **Cloudinary** pour les images (upload / remplacement)

## Démarrage

### 1. Variables d’environnement

Copiez `.env.example` vers `.env` et renseignez :

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."   # ex: openssl rand -base64 32
# Optionnel (upload d’images)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### 2. Base de données

```bash
npm run db:push
npm run db:seed
```

Le seed crée un admin par défaut (voir `prisma/seed.js`) :
- Email : `ADMIN_EMAIL` ou `admin@example.com`
- Mot de passe : `ADMIN_PASSWORD` ou `admin123`

### 3. Lancer l’app

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Utilisation

- **Connexion admin** : [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Une fois connecté, le bandeau affiche **« Mode édition »**. L’activer permet de :
  - **Accueil** : remplacer la bannière (bouton « Remplacer »), gérer les images du carrousel de logos
  - **Notre Comité** : ajouter / modifier / supprimer des membres (photo, nom, titre)
  - **Blog** : géré depuis **Admin → Gérer les articles** (création, brouillon/publication, suppression)
  - **Podcast** : ajouter / modifier / supprimer des épisodes (titre, lien YouTube, courte description)
  - **Événements** : ajouter / modifier / supprimer des événements (date, titre, description) ; clic sur un événement pour les détails
  - **Guide des commanditaires** : ajouter / supprimer des images, glisser-déposer pour réordonner

### Blog (articles)

- **Admin → Gérer les articles** : liste, « Nouvel article », modifier un article
- **Nouvel article / Modifier** : titre, slug (URL), image de couverture (upload), auteur (liste des auteurs), date de publication, case « Brouillon », éditeur riche (TipTap) pour le contenu
- Enregistrer en **brouillon** ou **Publier**. Suppression possible depuis la page d’édition.

### Auteurs

- **Admin → Gérer les auteurs** : ajouter / modifier / supprimer des auteurs (nom, photo optionnelle). Les auteurs sont proposés dans le sélecteur lors de la rédaction d’un article.

### Images

- En **mode édition**, sur une image (bannière, membre du comité, etc.) : bouton **« Remplacer »** → choix d’un fichier → upload vers Cloudinary (si configuré) et mise à jour en base.
- Pour le carrousel et le guide des commanditaires, vous pouvez aussi coller une **URL d’image** (après un upload manuel ou depuis l’API d’upload).

## Scripts

| Commande        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Serveur de développement       |
| `npm run build`| Build de production            |
| `npm run start`| Serveur de production         |
| `npm run db:push` | Appliquer le schéma Prisma |
| `npm run db:seed` | Créer l’admin initial       |
| `npm run db:studio` | Ouvrir Prisma Studio      |

## Structure des pages

- `/` – Accueil (bannière + carrousel)
- `/notre-comite` – Membres du comité
- `/blog` – Liste des articles publiés
- `/blog/[slug]` – Article
- `/podcast` – Épisodes (YouTube)
- `/evenements` – Calendrier FullCalendar
- `/guide-commanditaires` – Images des commanditaires
- `/admin` – Tableau de bord admin
- `/admin/login` – Connexion
- `/admin/blog` – Gestion des articles
- `/admin/blog/new` – Nouvel article
- `/admin/blog/[id]` – Édition d’un article
- `/admin/authors` – Gestion des auteurs

## Création du premier admin (sans seed)

Vous pouvez aussi créer un admin via l’API :

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"VotreMotDePasse"}'
```

En production, il est recommandé de désactiver ou de protéger cette route.
