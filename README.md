# Thibault — carnet de route

**En ligne :** https://thibaultheyt.github.io/Portfolio-voiture/ — publication
automatique à chaque envoi sur `main`.

Un portfolio automobile en page unique : thème sombre rouge, **hero avec la
voiture 3D plein cadre** et titre par-dessus, bandeau défilant, expériences et
fiche technique, carnet, module des terrains et contact.

## Lancer le projet

```sh
bun install
bun run dev        # http://localhost:5173
bun run build      # dist/client (assets) + dist/portfolio/index.js (Worker)
bun run typecheck
```

## La scène 3D

Le hero affiche le **vrai modèle GLB** de la voiture, jamais une image ni une
silhouette provisoire :

- `src/app/lib/carModels.ts` : télécharge et analyse les huit modèles une fois
  pour toutes, les garde en cache et expose la progression du préchargement.
- `src/app/components/CarViewer.tsx` : la scène (caméra, studio HDRI fait de
  boîtes à lumière, ombres portées, sol), le cadrage automatique des fichiers et
  l'interaction. On fait tourner la voiture en glissant à la souris ou au doigt ;
  elle tourne aussi seule quand on ne la touche pas, sauf si
  `prefers-reduced-motion` est actif.
- `src/data/carShapes.ts` : les tracés SVG qui dessinent les vignettes du
  sélecteur (le tracé n'est plus extrudé en 3D).

Changer de voiture : flèches, boutons ← → du clavier, ou vignettes.

### Aperçus réalistes (fiche)

La fiche n'embarque plus de lecteur externe : chaque voiture porte un rendu du
vrai modèle, aux mêmes couleurs que la scène (`preview` dans
`src/data/cars.ts`, fichiers dans `public/models/previews/`). La grande image et
les vignettes du sélecteur utilisent ces rendus.

Un clic sur la grande image lance la scène 3D **sur place**, au même angle et au
même cadrage que l'aperçu (`PREVIEW_ANGLE` / `PREVIEW_ZOOM` dans
`CarStage.tsx`) : on fait tourner la voiture à la souris ou au doigt, puis
« Fermer » ramène l'image.

Les aperçus sont pris de trois quarts avant, à 1600 × 900, sur fond de studio.
Pour en régénérer un après un changement de couleur ou de modèle : ouvrir la
fiche, glisser pour amener la voiture à l'angle voulu, puis enregistrer le
canvas en JPEG dans `public/models/previews/<slug>.jpg` (le nom doit
correspondre à celui de `preview`).

### Vraies maquettes 3D

Les huit modèles sont dans `public/models/` et chargés par le hero (`model` dans
`src/data/cars.ts`) : Audi R8, Ford Ranger, Audi RS4, Renault RE40, Suzuki
Swift, Alpine A110, Mazda MX-5 et le kart. Le chargeur gère Draco, recadre et
pose la voiture automatiquement ; si un fichier manque ou casse, la silhouette
générée reprend la main sans erreur visible.

Deux réglages par fiche, au besoin : `modelRotation` (axe du fichier) et
`modelScale` (cadrage). `paint` porte la couleur de carrosserie de la vraie
voiture : le matériau nommé est repeint (`Body` de la Swift, `car_paint` de la
RS4, `carpaint` de la MX-5, la caisse du Ranger, `WindowInside` de l'Alpine —
le nom est trompeur dans ce fichier). La Swift, exportée sans textures, reçoit
en plus ses vitrages, chromes et plastiques d'après le nom des matériaux.

Les deux modèles à livrée — la Formule Renault et le kart — gardent leur
décor d'origine : leur peinture est une texture complète, la reteinter rendrait
la livrée verte ou illisible.

Le crédit (titre, auteur, licence) est obligatoire pour les licences CC et
s'affiche sous le récit. Trois modèles sont en **CC BY-NC(-SA/ND)** : usage non
commercial uniquement.

Les modèles sont lourds (87 Mo pour la Swift) : le premier affichage de cette
fiche prend quelques secondes selon la connexion.

## Écran de chargement

`src/app/components/Preloader.tsx` s'affiche au chargement de la page et suit le
vrai travail en cours : polices, images, puis premier rendu WebGL (signalé par
l'événement `scene:ready`, émis par le `Canvas` de `CarViewer`). Aucun faux
compte à rebours : le rail gradué et le pourcentage avancent avec ces étapes,
avec un plancher de 1,2 s pour rester lisible. Si la 3D ne répond pas en 3,5 s,
le chargement se termine quand même. Rien ne s'affiche quand
`prefers-reduced-motion` est actif.

## Personnaliser

- `src/data/cars.ts` : les voitures. Ordre, marque, modèle, année, catégorie,
  terrain, couleur, phrase forte (`appris`), récit (`recit`), chiffres clés et
  fiche technique. `modele3d` affiche en rouge une précision quand le fichier
  3D n'est pas exactement la voiture conduite (la Swift et la Formule Renault
  pour l'instant). C'est le fichier à réécrire en premier.
- `src/data/site.ts` : nom, ville, fuseau, textes du hero, liens Instagram et
  YouTube, et la liste `terrains` (lieux de la carte : coordonnées, récit,
  mesure et voiture associée).
- `src/data/carShapes.ts` : la silhouette de secours de chaque type de
  carrosserie (vignette affichée si un aperçu manque).
- `index.html` : titre et description pour le référencement.

## Page unique

Le menu pointe vers des ancres : `#experiences` (fiche et sélecteur), `#carnet`
(liste des voitures), `#terrains` (carte des circuits et des routes) et
`#contact` (message direct Instagram). Aucune route supplémentaire. La scène 3D
vit dans le hero (`#top`).

## Carte des terrains

`src/app/components/TerrainMap.tsx` affiche les lieux sur une carte dessinée en
SVG : fond transparent, contours de pays, graticule, trajets en pointillés et
pins, tous dans le rouge de l'accent. Un clic sur un point (ou sur une ligne de
la liste) cadre la carte sur le lieu et ouvre sa fiche : ce qui s'est passé
là-bas (`note`), la mesure de la session et la voiture associée (`car`, un slug
de `cars.ts`), avec un lien vers la fiche 3D.

Les points sont en HTML au-dessus du SVG, donc ils gardent la même taille et la
même zone de clic à tous les niveaux de zoom. Les trois lieux autour de
Bordeaux sont regroupés sous une pastille « 3 » qui, au clic, zoome et ouvre la
liste des trois — leurs points sont à quelques kilomètres, ils se
chevaucheraient à l'échelle de la carte.

Les tracés viennent de `src/data/mapGeo.ts`, généré depuis Natural Earth
(`ne_50m_admin_0_countries`) et simplifié : ne pas l'éditer à la main. Les
coordonnées, les récits et la voiture de chaque lieu sont dans `terrains`
(`src/data/site.ts`) ; le point se place tout seul à partir de `coord`.

## Contact

Il n'y a plus de formulaire : il n'envoyait rien et laissait croire le contraire.
Le bouton de la section contact ouvre un **message direct Instagram** sur le
compte défini par le lien `Instagram` de `src/data/site.ts`
(`https://ig.me/m/<pseudo>`) : le message s'écrit dans Instagram, pas sur le site.

Un temps, le texte était composé sur le site puis copié dans le presse-papiers
avant d'ouvrir la conversation. C'est revenu en arrière : le collage n'est pas
naturel pour un visiteur et l'onglet ouvert ne garde pas le champ. Instagram
n'accepte de toute façon pas de texte prérempli (seul un paramètre `ref`
existe), donc il n'y a rien à préremplir : le bouton suffit.

Le pseudo est déduit du lien `Instagram`, donc changer d'adresse suffit à
changer de destinataire.

Le Worker (`src/worker/index.ts`) ne garde que `/api/health` et le service des
assets.

## Publier sur GitHub Pages

Le site est statique : `dist/client` suffit, le Worker du projet (`/api/health`)
n'est pas utilisé. Un workflow (`.github/workflows/deploy.yml`) construit et
publie à chaque envoi sur `main`.

À faire une fois dans le dépôt GitHub : **Settings → Pages → Build and
deployment → Source : GitHub Actions**. Le site sort sur
`https://<pseudo>.github.io/<dépôt>/`.

Le workflow construit avec `VITE_BASE=/<dépôt>/`, parce que Pages sert le site
dans un sous-dossier : sans cette base, `/models/...` et `/draco/...`
tomberaient à la racine du domaine. Tous les fichiers de `public/` passent par
`asset()` (`src/app/lib/asset.ts`) pour suivre cette base. En local, la base
reste `/` : rien à changer.

### Poids des modèles

Les huit GLB d'origine pèsent 163 Mo. Ils ont été compressés en Draco (le
chargeur décode déjà ce format, voir `public/draco/`) et pèsent maintenant
33 Mo, dont 8 Mo pour la Swift. Pour refaire l'opération après un nouveau
modèle :

```sh
bun x @gltf-transform/cli draco entree.glb sortie.glb
```

La compression ne touche que la géométrie : matériaux, textures et noms de
matériaux sont conservés, donc les couleurs (`paint`) s'appliquent pareil.

## Déployer avec Freebuff Sites

`deploy.json` pointe vers la sortie de build. Après `bun run build`, déployez
avec l'outil `sites_deploy` depuis ce dossier.
