// Le parc auto. Tout ce qui s'affiche dans la scène 3D et le panneau vient
// d'ici.
//
// `recit` est la partie personnelle : où la voiture a été conduite, ce qu'elle
// a changé dans la conduite, ce qu'elle a appris. `appris` est la phrase
// courte affichée en citation, `terrain` le contexte.
//
// Chaque voiture est dessinée en 3D à partir de son profil (`carShapes.ts`) :
// le type de carrosserie `art` détermine le volume généré.

export type CarArt = 'pickup' | 'supercar' | 'wagon' | 'formula' | 'hatch' | 'coupe' | 'roadster'

export interface Car {
  slug: string
  marque: string
  modele: string
  annee?: string
  categorie: string
  terrain: string
  tint: string
  art: CarArt
  /** Chemin d'un modèle 3D réel dans public/models (.glb ou .gltf).
   *  Sans ce champ, la silhouette générée est affichée à la place. */
  model?: string
  /** Rotation du modèle autour de la verticale, en radians (défaut : 90°). */
  modelRotation?: number
  /** Facteur d'échelle appliqué après le cadrage automatique. */
  modelScale?: number
  /** Rendu du modèle réel (mêmes couleurs que la scène), utilisé dans la fiche
   *  et dans le sélecteur. */
  preview?: string
  /** Précision affichée en rouge quand le fichier 3D n'est pas exactement la
   *  voiture conduite (autre génération, autre modèle). */
  modele3d?: string
  /** Peinture de la carrosserie : le matériau nommé reçoit `color`. Avec
   *  `tintOnly`, on ne change que la couleur (le matériau garde ses réglages et
   *  sa texture). Les autres matériaux d'un GLB sans textures sont colorés
   *  d'après leurs noms. */    paint?: { material: string; color: string; tintOnly?: boolean; texturePaint?: boolean }
  /** Crédit obligatoire pour un modèle sous licence CC BY. */
  credit?: { label: string; url: string }
  tagline: string
  appris: string
  recit: string[]
  chiffres: { value: string; unit: string; label: string }[]
  specs: { label: string; value: string }[]
}

export const cars: Car[] = [
  {
    slug: 'audi-r8-v8',
    marque: 'Audi',
    modele: 'R8 V8',
    categorie: 'Supercar',
    terrain: 'Circuit',
    tint: '#e3e4e2',
    art: 'supercar',
    model: '/models/audi-r8-v8.glb',
    preview: '/models/previews/audi-r8-v8.jpg',
    credit: { label: 'Audi R8 — Randomness, CC BY 4.0', url: 'https://sketchfab.com/3d-models/audi-r8-0e5c6feed3ff489093e33e686dd8f796' },
    tagline: 'Trois tours à Mérignac pour comprendre ce que change un moteur central.',
    appris: 'Le freinage se gagne au lever de pied.',
    recit: [
      "Trois tours sur le circuit de Mérignac, près de Bordeaux. Le temps de comprendre que la voiture ne se conduit pas comme une berline : le moteur est derrière l'épaule, l'avant est léger, et le freinage déplace tout le poids d'un coup.",
      "Ce que j'ai retenu, c'est le travail au lever de pied : freiner plus tard, tourner plus tôt, laisser la voiture pivoter. Le V8 accompagne chaque correction et la ligne rouge arrive bien plus vite que l'oreille ne l'annonce.",
    ],
    chiffres: [
      { value: '420', unit: 'ch', label: 'Puissance' },
      { value: '430', unit: 'Nm', label: 'Couple' },
      { value: '4,4', unit: 's', label: '0 à 100' },
    ],
    specs: [
      { label: 'Moteur', value: '4.2 FSI V8, 8 250 tr/min' },
      { label: 'Transmission', value: 'R tronic 6, quattro' },
      { label: 'Poids', value: '1 560 kg' },
      { label: 'Architecture', value: 'Moteur central arrière' },
    ],
  },
  {
    slug: 'ford-ranger-wildtrak',
    marque: 'Ford',
    modele: 'Ranger Wildtrak',
    annee: '2016',
    categorie: 'Pick-up',
    terrain: 'Montagne suisse',
    tint: '#1b1c1e',
    art: 'pickup',
    model: '/models/ford-ranger-wildtrak.glb',
    preview: '/models/previews/ford-ranger-wildtrak.jpg',
    // La peinture est dans la texture du fichier : seuls ses pixels changent,
    // les feux, vitres et chromes restent intacts.
    paint: { material: 'wire_006134006', color: '#1b1c1e', texturePaint: true },
    credit: { label: 'Ford Ranger 2019 — TSB3DMODELS, CC BY-NC 4.0', url: 'https://sketchfab.com/3d-models/ford-ranger-2019-blue-3f7e1abb70cd476e8dd6de506c2ef417' },
    tagline: 'Les routes vaudoises au volant du pick-up de mon frère.',
    appris: 'Anticiper plutôt que subir.',
    recit: [
      "Conduite en Suisse, dans le canton de Vaud, avec le Ranger de mon frère. La position haute change tout : on lit la route loin devant, on voit les virages arriver, et on prend l'habitude de gérer l'élan plutôt que de freiner dans l'urgence.",
      "Le cinq cylindres diesel pousse bas et garde du couple dans les montées, même chargé. Avec lui, j'ai appris à conduire au couple et à anticiper : une école de patience qui sert ensuite partout.",
    ],
    chiffres: [
      { value: '200', unit: 'ch', label: 'Puissance' },
      { value: '470', unit: 'Nm', label: 'Couple' },
      { value: '10,6', unit: 's', label: '0 à 100' },
    ],
    specs: [
      { label: 'Moteur', value: '3.2 TDCi, 5 cylindres' },
      { label: 'Transmission', value: 'BVA 6, 4x4' },
      { label: 'Poids', value: '2 240 kg' },
      { label: 'Année', value: '2016' },
    ],
  },
  {
    slug: 'audi-rs4-b8',
    marque: 'Audi',
    modele: 'RS4 B8',
    categorie: 'Break sportif',
    terrain: 'Route & vidéo',
    tint: '#b9bab5',
    art: 'wagon',
    model: '/models/audi-rs4-b8.glb',
    preview: '/models/previews/audi-rs4-b8.jpg',
    paint: { material: 'car_paint', color: '#b9bab5' },
    credit: { label: 'Audi RS4 Avant — Ddiaz Design, CC BY-NC-SA 4.0', url: 'https://sketchfab.com/3d-models/2013-audi-rs4-avant-09c0c62808364c1e9381b2363dc76916' },
    tagline: 'Un essai sur route et un shooting vidéo pour la chaîne.',
    appris: 'La polyvalence peut être violente.',
    recit: [
      "Essai sur route avec la RS4 de mon frère, et un shooting vidéo pour la chaîne YouTube. Le break reste discret en ville, mais dès que la route se libère, le V8 change complètement le ton.",
      "C'est aussi la voiture qui m'a montré à quel point le quattro et les pneus comptent plus que la puissance annoncée : sous la pluie, elle reste collée et laisse surtout parler le freinage. Le son au démarrage reste un souvenir à part.",
    ],
    chiffres: [
      { value: '450', unit: 'ch', label: 'Puissance' },
      { value: '430', unit: 'Nm', label: 'Couple' },
      { value: '4,7', unit: 's', label: '0 à 100' },
    ],
    specs: [
      { label: 'Moteur', value: '4.2 FSI V8, 8 250 tr/min' },
      { label: 'Transmission', value: 'S tronic 7, quattro' },
      { label: 'Poids', value: '1 795 kg' },
      { label: 'Carrosserie', value: 'Avant, 5 portes' },
    ],
  },
  {
    slug: 'formule-renault',
    marque: 'Formule',
    modele: 'Renault 2.0',
    categorie: 'Monoplace',
    terrain: 'Circuit',
    tint: '#1a3ea6',
    art: 'formula',
    model: '/models/formule-renault.glb',
    preview: '/models/previews/formule-renault.jpg',
    modele3d: 'Rendu 3D non représentatif.',
    credit: { label: 'Renault RE40 — JUST GAME, CC BY 4.0', url: 'https://sketchfab.com/3d-models/renault-re40-7b24b5ea230e44ddbcd66ae02c3c22e5' },
    tagline: 'Six tours à Haute-Saintonge, sans filtre.',
    appris: 'Tout se joue avant le virage.',
    recit: [
      "Six tours sur le circuit de Haute-Saintonge. Pas de direction assistée, pas d'ABS, pas d'aides : chaque mouvement part directement dans les roues, et les premières sorties de stand servent à réapprendre à regarder loin.",
      "L'appui colle la voiture au sol, le freinage est d'une violence rare. Six tours suffisent pour comprendre que la vitesse se gagne avant le virage : au lever de pied, au placement, et dans le regard.",
    ],
    chiffres: [
      { value: '130', unit: 'ch', label: 'Puissance' },
      { value: '450', unit: 'kg', label: 'Poids' },
      { value: '1.6', unit: 'L', label: 'Cylindrée' },
    ],
    specs: [
      { label: 'Moteur', value: '1.6 16v, 4 cylindres' },
      { label: 'Transmission', value: 'Séquentielle 6, propulsion' },
      { label: 'Poids', value: '450 kg' },
      { label: 'Appui', value: 'Ailerons avant et arrière' },
    ],
  },
  {
    slug: 'suzuki-swift-sport',
    marque: 'Suzuki',
    modele: 'Swift Sport',
    annee: '2016',
    categorie: 'Citadine sportive',
    terrain: 'Circuit',
    tint: '#e7e3da',
    art: 'hatch',
    model: '/models/suzuki-swift-sport.glb',
    preview: '/models/previews/suzuki-swift-sport.jpg',
    modele3d: 'Rendu 3D non représentatif.',
    paint: { material: 'Body', color: '#ece9e2' },
    credit: { label: 'Suzuki Swift Sport — DR1KING100K, CC BY 4.0', url: 'https://sketchfab.com/3d-models/suzuki-swift-sport-cfba568fdc6f45fca3c2ca4bb7e4dee2' },
    tagline: 'Ma première voiture : le Nürburgring, Spa et le col d’Aubisque.',
    appris: 'La légèreté bat la puissance.',
    recit: [
      "Ma première voiture. Trois tours du Nürburgring et deux heures à Spa-Francorchamps avec elle : deux circuits qui n'ont rien à voir, et pourtant la même leçon — la légèreté et la précision comptent plus que les chevaux.",
      "À Spa, les enchaînements et le dénivelé m'ont appris à être régulier. Au Nürburgring, j'ai surtout appris l'humilité : la piste est longue, les repères changent tout le temps, et la voiture prévient avant de décrocher. C'est là que j'ai vraiment commencé à piloter.",
      "Une journée dans les Pyrénées pour monter au col d'Aubisque : les lacets, les pourcentages, et la boîte courte qui oblige à choisir son rapport avant d'entrer dans le virage.",
    ],
    chiffres: [
      { value: '136', unit: 'ch', label: 'Puissance' },
      { value: '160', unit: 'Nm', label: 'Couple' },
      { value: '8,7', unit: 's', label: '0 à 100' },
    ],
    specs: [
      { label: 'Moteur', value: '1.6 VVT 16v atmosphérique' },
      { label: 'Transmission', value: 'Manuelle 6, traction' },
      { label: 'Poids', value: '1 045 kg' },
      { label: 'Année', value: '2016' },
    ],
  },
  {
    slug: 'alpine-a110-gts',
    marque: 'Alpine',
    modele: 'A110 GTS',
    categorie: 'Coupé sport',
    terrain: 'Route',
    tint: '#1f63c8',
    art: 'coupe',
    model: '/models/alpine-a110-gts.glb',
    preview: '/models/previews/alpine-a110-gts.jpg',
    // Le nom du matériau de carrosserie est trompeur dans ce fichier.
    paint: { material: 'Alpine_A110_2018WindowInside_Material', color: '#1f63c8', tintOnly: true },
    credit: { label: 'Alpine A110 — Ddiaz Design, CC BY-NC-SA 4.0', url: 'https://sketchfab.com/3d-models/2022-alpine-a110-00fc322c91f04f23acae09910620937f' },
    tagline: "Le Blue Tour d'Alpine, 45 minutes vers le Cap Ferret.",
    appris: 'La précision remplace le bruit.',
    recit: [
      "Essai organisé par Alpine, le Blue Tour, sur la route du Cap Ferret. Quarante-cinq minutes au volant : assez pour sentir la légèreté, la direction précise et un châssis qui n'a pas besoin de bruit pour exister.",
      "Ce que j'ai retenu, c'est la confiance qu'elle installe : on freine plus tard, on tourne plus tôt, et la boîte enchaîne sans à-coups. Une voiture qui donne envie de rouler propre plutôt que de faire du bruit.",
    ],
    chiffres: [
      { value: '300', unit: 'ch', label: 'Puissance' },
      { value: '340', unit: 'Nm', label: 'Couple' },
      { value: '4,2', unit: 's', label: '0 à 100' },
    ],
    specs: [
      { label: 'Moteur', value: '1.8 turbo, 4 cylindres' },
      { label: 'Transmission', value: 'DCT 7, propulsion' },
      { label: 'Poids', value: '1 183 kg' },
      { label: 'Architecture', value: 'Moteur central arrière' },
    ],
  },
  {
    slug: 'mazda-mx5-nc',
    marque: 'Mazda',
    modele: 'MX-5 NC',
    categorie: 'Cabriolet',
    terrain: 'Route',
    tint: '#191a1c',
    art: 'roadster',
    model: '/models/mazda-mx5-nc.glb',
    preview: '/models/previews/mazda-mx5-nc.jpg',
    paint: { material: 'carpaint', color: '#191a1c' },
    // Ce fichier est déjà orienté dans le bon axe : pas de quart de tour.
    modelRotation: 0,
    credit: { label: 'Mazda MX-5 — Res1n, CC BY 4.0', url: 'https://sketchfab.com/3d-models/2009-mazda-miata-mx-5-roadster-96056443d55c4afaa90099e9e1d45d9b' },
    tagline: "Quarante minutes sur route avec le cabriolet d'un ami.",
    appris: 'Peu de puissance, beaucoup de plaisir.',
    recit: [
      "La MX-5 d'un ami, un cabriolet NC, pour quarante minutes sur route. Toit ouvert, moteur atmosphérique, boîte mécanique courte : le genre de voiture qui rend une simple départementale intéressante.",
      "Elle rappelle qu'on peut prendre du plaisir sans vitesse excessive : le châssis est équilibré, la direction parle, et chaque virage se prend avec ce qu'il faut de gaz. C'est sûrement la voiture qui m'a le plus donné envie de conduire pour le plaisir.",
    ],
    chiffres: [
      { value: '126', unit: 'ch', label: 'Puissance' },
      { value: '167', unit: 'Nm', label: 'Couple' },
      { value: '9,4', unit: 's', label: '0 à 100' },
    ],
    specs: [
      { label: 'Moteur', value: '1.8 MZR 16v atmosphérique' },
      { label: 'Transmission', value: 'Manuelle 5, propulsion' },
      { label: 'Poids', value: '1 095 kg' },
      { label: 'Carrosserie', value: 'Cabriolet, 2 places' },
    ],
  },
  {
    slug: 'karting-bordeaux-lac',
    marque: 'Karting',
    modele: 'de location',
    categorie: 'Location indoor',
    terrain: 'Indoor',
    tint: '#e0362c',
    art: 'formula',
    model: '/models/go-kart.glb',
    preview: '/models/previews/karting-bordeaux-lac.jpg',
    // Le kart est très large par rapport à sa longueur : un peu plus petit
    // pour ne pas sortir du cadre de trois quarts.
    modelScale: 0.78,
    credit: { label: 'Go Kart — GRIP420, CC BY-NC-ND 4.0', url: 'https://sketchfab.com/3d-models/go-kart-db54b705c0e546229fb43c55d7e7ad3f' },
    tagline: 'Le karting de location indoor, à Bordeaux Lac, en thermique.',
    appris: 'La régularité bat le tour parfait.',
    recit: [
      "Chaque année, le même rendez-vous au karting de location de Bordeaux Lac : un circuit indoor, des karts thermiques de 270 cm³ et un tracé court, avec des murs partout. Pas de réglage ni de préparation, tout se joue au pilotage.",
      "Mon meilleur tour y est de 55 s 722. Je le dois moins à un freinage héroïque qu'à la régularité : retrouver la même trajectoire tour après tour, laisser le moteur respirer, et ne pas se battre avec le volant.",
    ],
    chiffres: [
      { value: '55,722', unit: 's', label: 'Meilleur tour' },
      { value: '9', unit: 'ch', label: 'Puissance' },
      { value: '270', unit: 'cm³', label: 'Cylindrée' },
    ],
    specs: [
      { label: 'Kart', value: 'Location, 4 temps 270 cm³' },
      { label: 'Puissance', value: '9 ch' },
      { label: 'Piste', value: 'Indoor, Bordeaux Lac' },
      { label: 'Meilleur tour', value: '55 s 722' },
    ],
  },
]
