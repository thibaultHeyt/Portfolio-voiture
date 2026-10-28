# Modèles 3D réels

Les huit modèles sont dans ce dossier, servis tels quels : un fichier
`public/models/audi-r8-v8.glb` est accessible à l'adresse
`/models/audi-r8-v8.glb`.

| Voiture | Fichier | Auteur | Licence | Poids |
| --- | --- | --- | --- | --- |
| Audi R8 V8 | `audi-r8-v8.glb` | Randomness | CC BY 4.0 | 3,3 Mo |
| Ford Ranger Wildtrak | `ford-ranger-wildtrak.glb` | TSB3DMODELS | CC BY-NC 4.0 | 2,0 Mo |
| Audi RS4 B8 | `audi-rs4-b8.glb` | Ddiaz Design | CC BY-NC-SA 4.0 | 4,3 Mo |
| Formule Renault | `formule-renault.glb` | JUST GAME | CC BY 4.0 | 14,1 Mo |
| Suzuki Swift Sport | `suzuki-swift-sport.glb` | DR1KING100K | CC BY 4.0 | 91,7 Mo |
| Alpine A110 GTS | `alpine-a110-gts.glb` | Ddiaz Design | CC BY-NC-SA 4.0 | 15,8 Mo |
| Mazda MX-5 NC | `mazda-mx5-nc.glb` | Res1n | CC BY 4.0 | 35,9 Mo |
| Karting de location | `go-kart.glb` | GRIP420 | CC BY-NC-ND 4.0 | 3,1 Mo |

Les licences **NC** interdisent l'usage commercial, la **ND** interdit les
modifications : le crédit affiché sous chaque fiche est donc obligatoire.

## Comment c'est branché

Dans `src/data/cars.ts`, chaque fiche porte `model` et `credit`, parfois :

```ts
model: '/models/mazda-mx5-nc.glb',
modelRotation: 0, // fichier déjà orienté dans le bon axe (sinon 90°)
modelScale: 0.78, // cadrage plus petit pour un modèle très large (le kart)
```

Le chargeur gère **Draco** (décodeur dans `public/draco/`), recadre, centre et
pose la voiture au sol automatiquement. La caméra recule selon la largeur de
l'écran pour que la voiture tienne entière, vue de profil.

Les huit fichiers sont téléchargés et analysés **pendant l'écran de
chargement** (`src/app/lib/carModels.ts`), puis gardés en cache : le hero
affiche directement la voiture demandée, sans silhouette provisoire. Au-delà de
20 s de chargement, la page s'ouvre quand même et la suite arrive en tâche de
fond.

Certains exports marquent toute la carrosserie en `alphaMode: BLEND` à opacité
pleine (c'est le cas de la R8) : le moteur la rendait translucide et on voyait
l'intérieur à travers les portes. Les matériaux transparents à plus de 85 %
d'opacité sont désormais rendus opaques.

## Couleurs de carrosserie

Chaque fiche porte la couleur de la vraie voiture dans `paint` : le matériau
nommé est repeint, et `tintOnly` ne change que la couleur (le matériau garde
sa texture et ses réglages).

| Voiture | Matériau | Couleur |
| --- | --- | --- |
| Audi R8 | (peinture d'origine) | argent |
| Ford Ranger | `wire_006134006` | noir |
| Audi RS4 | `car_paint` | gris argent |
| Formule Renault | (livrée d'origine) | jaune |
| Suzuki Swift | `Body` | blanc |
| Alpine A110 | `Alpine_A110_2018WindowInside_Material` | bleu Alpine |
| Mazda MX-5 | `carpaint` | noir |
| Kart | (livrée d'origine) | bleu |

```ts
paint: { material: 'car_paint', color: '#b9bab5' },
```

La Swift a été exportée sans textures : ses 89 matériaux sortent tous en gris.
En plus de `Body`, les noms contenant `GLASS` deviennent des vitrages sombres,
`CHROME` / `RIM` / `DISC` du métal, `BLACK` / `PLASTIC` / `CARBON` du noir, et
les `INT_*` l'habitacle. Changer `color` suffit pour changer la couleur.La peinture de la Formule Renault et du kart est une livrée complète dans la
   texture : la reteinter salit le décor (le jaune Renault vire au vert), donc ces
   deux fiches gardent leur décoration d'origine.

Pour le Ranger, la peinture est dans la planche de textures : seuls les panneaux
bleu franc sont repeints. Les pixels très sombres (vitres teintées) et les gris
(feux, chromes) sont laissés tels quels, sinon la voiture devient un bloc noir.

## Aperçus

`public/models/previews/<slug>.jpg` contient le rendu de chaque voiture, aux
mêmes couleurs que la scène. Il sert la grande image de la fiche et les vignettes
du sélecteur (`preview` dans `src/data/cars.ts`).

## Remplacer un modèle

Déposer le nouveau `.glb` ici, mettre à jour `model` (et au besoin
`modelRotation` / `modelScale`) et le `credit` sur la fiche, puis régénérer
l'aperçu. Sans fichier, le hero de cette fiche reste vide : le site n'affiche
plus de silhouette générée.
