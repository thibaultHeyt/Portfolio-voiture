// L'identité du site.

export const site = {
  name: 'Thibault',
  role: 'Carnet de route',
  location: 'Bordeaux',
  timezone: 'Europe/Paris',
  kicker: 'Route & circuit',
  intro:
    "Je m'appelle Thibault. Je conduis depuis Bordeaux, sur route et sur circuit, et je garde ici la trace de ce que chaque voiture m'a appris : le freinage, la confiance, le regard, la patience.",
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/titou_cars' },
    { label: 'YouTube', href: 'https://www.youtube.com/channel/UCMXURDoLprnu-oFZAM1VU2A/' },
  ],
  marquee: ['Ford Ranger Wildtrak', 'Audi R8 V8', 'Audi RS4 B8', 'Formule Renault', 'Suzuki Swift Sport', 'Alpine A110 GTS', 'Mazda MX-5 NC', 'Karting de location'],
}

/** Les lieux où ces voitures ont roulé, avec la mesure de chaque session. */
export interface Terrain {
  name: string
  region: string
  country: string
  kind: 'Circuit' | 'Route' | 'Montagne'
  measure: string
  laps?: number
  /** Latitude et longitude du lieu, pour le point sur la carte. */
  coord: [number, number]
  /** Ce qui s'est passé là-bas, affiché dans la fiche du lieu. */
  note: string
  /** Voiture associée (slug de cars.ts). */
  car?: string
}

export const terrains: Terrain[] = [
  {
    name: 'Mérignac',
    region: 'Gironde, France',
    country: 'France',
    kind: 'Circuit',
    measure: '3 tours',
    laps: 3,
    coord: [44.833, -0.645],
    note: "Trois tours sur le circuit de Mérignac, avec la R8. Le premier vrai roulage sur piste : apprendre à freiner plus tard, à regarder plus loin, et à laisser la voiture respirer avant de chercher la vitesse.",
    car: 'audi-r8-v8',
  },
  {
    name: 'Karting de location',
    region: 'Bordeaux Lac, France',
    country: 'France',
    kind: 'Circuit',
    measure: '55,722 s',
    coord: [44.897, -0.578],
    note: "Le rendez-vous annuel du karting indoor de Bordeaux Lac, en thermique. Un tracé court, des murs partout, des karts de 270 cm³ identiques pour tout le monde : tout se joue au pilotage. Meilleur tour en 55,722 s.",
    car: 'karting-bordeaux-lac',
  },
  {
    name: 'Haute-Saintonge',
    region: 'Charente-Maritime, France',
    country: 'France',
    kind: 'Circuit',
    measure: '6 tours',
    laps: 6,
    coord: [45.216, -0.033],
    note: "Six tours en Formule Renault sur le circuit de Haute-Saintonge, à La Genétouze. Pas de direction assistée, pas d'ABS, pas d'aides : chaque geste part directement dans les roues, et l'appui fait tout le travail.",
    car: 'formule-renault',
  },
  {
    name: 'Nürburgring',
    region: 'Rhénanie, Allemagne',
    country: 'Allemagne',
    kind: 'Circuit',
    measure: '3 tours',
    laps: 3,
    coord: [50.3356, 6.9475],
    note: "Trois tours de la Nordschleife avec la Swift. La piste la plus longue et la plus intimidante de la liste : les repères changent tout le temps, la voiture prévient avant de décrocher, et on ressort avec l'humilité d'un débutant.",
    car: 'suzuki-swift-sport',
  },
  {
    name: 'Spa-Francorchamps',
    region: 'Wallonie, Belgique',
    country: 'Belgique',
    kind: 'Circuit',
    measure: '2 heures',
    coord: [50.437, 5.971],
    note: "Deux heures à Spa-Francorchamps avec la Swift. Le dénivelé, Eau Rouge, le raidillon derrière le muret : deux heures pour comprendre que la régularité rapporte plus que le dernier dixième.",
    car: 'suzuki-swift-sport',
  },
  {
    name: 'Cap Ferret',
    region: 'Bassin d’Arcachon, France',
    country: 'France',
    kind: 'Route',
    measure: '45 min',
    coord: [44.642, -1.245],
    note: "Le Blue Tour d'Alpine : quarante-cinq minutes de route vers le Cap Ferret, en convoi, pour sentir la légèreté et la direction précise de l'A110 sur une route ouverte.",
    car: 'alpine-a110-gts',
  },
  {
    name: 'Cols & lacets',
    region: 'Pyrénées, France',
    country: 'France',
    kind: 'Montagne',
    measure: '1 journée',
    coord: [42.95, 0.15],
    note: "Une journée de cols avec le Ranger de mon frère. La position haute change la lecture de la route : on voit les lacets arriver de loin, et on apprend à gérer l'élan plutôt qu'à freiner dans l'urgence.",
    car: 'ford-ranger-wildtrak',
  },
  {
    name: 'Départementales',
    region: 'Autour de Bordeaux',
    country: 'France',
    kind: 'Route',
    measure: '40 min',
    coord: [44.95, -0.75],
    note: "Quarante minutes de départementales autour de Bordeaux avec la MX-5 d'un ami, toit ouvert. Peu de puissance, une boîte courte, un châssis qui parle : la route la plus simple devient intéressante.",
    car: 'mazda-mx5-nc',
  },
]
