import type { CarArt } from './cars'

// Profils latéraux des voitures, dans un repère SVG de 1000 × 400.
// Ils servent deux fois : dessinés en SVG dans les vignettes, et extrudés en
// volume dans la scène 3D. Un seul jeu de tracés, donc des formes cohérentes.

export interface CarShape {
  body: string
  glass: string[]
  lines: string[]
  wheels: { x: number; r: number }[]
}

export const carShapes: Record<CarArt, CarShape> = {
  pickup: {
    body: 'M58 300 L58 234 Q58 216 80 212 L298 198 L350 134 Q360 120 380 120 L520 120 Q540 120 550 134 L602 198 L902 208 Q938 212 940 242 L940 300 Z',
    glass: ['M316 192 L360 142 L516 142 L526 192 Z'],
    lines: ['M352 202 L352 292'],
    wheels: [
      { x: 232, r: 58 },
      { x: 792, r: 58 },
    ],
  },
  supercar: {
    body: 'M52 300 L56 268 Q62 248 92 244 L232 232 Q288 214 330 196 Q392 154 472 146 Q558 138 638 166 L764 204 Q884 208 926 230 Q952 244 950 268 L948 300 Z',
    glass: ['M344 198 Q400 158 474 152 Q546 148 606 172 L634 198 Z'],
    lines: ['M690 232 L860 238'],
    wheels: [
      { x: 246, r: 56 },
      { x: 770, r: 56 },
    ],
  },
  wagon: {
    body: 'M52 300 L52 250 Q52 230 74 226 L250 208 L300 142 Q312 126 336 126 L694 126 Q718 126 730 144 L792 210 L934 220 Q952 224 952 252 L952 300 Z',
    glass: ['M302 198 L342 150 L500 150 L500 198 Z', 'M516 150 L688 150 L744 198 L516 198 Z'],
    lines: [],
    wheels: [
      { x: 246, r: 56 },
      { x: 786, r: 56 },
    ],
  },
  formula: {
    body: 'M210 292 L246 258 L392 246 L392 292 Z M392 292 L392 240 Q392 228 414 226 L560 222 Q600 222 600 246 L600 292 Z M600 246 L760 244 Q790 244 800 262 L815 292 L600 292 Z M30 292 H230 V306 H30 Z M828 196 H960 V210 H828 Z M880 210 H890 V256 H880 Z',
    glass: ['M452 226 Q470 198 520 196 L566 198 L600 226 Z'],
    lines: [],
    wheels: [
      { x: 248, r: 54 },
      { x: 826, r: 64 },
    ],
  },
  hatch: {
    body: 'M72 300 L72 252 Q72 234 94 228 L246 208 L300 144 Q312 130 336 130 L596 130 Q626 130 642 152 L740 222 L902 230 Q932 234 932 260 L932 300 Z',
    glass: ['M302 198 L346 154 L590 154 Q610 154 620 168 L672 198 Z'],
    lines: ['M520 154 L520 228'],
    wheels: [
      { x: 250, r: 54 },
      { x: 778, r: 54 },
    ],
  },
  coupe: {
    body: 'M58 300 L62 264 Q70 248 100 242 L238 230 Q298 192 356 174 Q438 150 538 160 Q636 172 716 202 L862 218 Q918 226 934 248 Q944 262 942 300 Z',
    glass: ['M318 200 Q376 168 456 162 Q546 156 614 178 L664 200 Z'],
    lines: ['M700 214 L900 226'],
    wheels: [
      { x: 250, r: 54 },
      { x: 772, r: 54 },
    ],
  },
  roadster: {
    body: 'M56 300 L58 258 Q64 242 94 236 L322 222 L366 180 Q374 170 392 170 L410 172 L446 218 Q470 230 520 230 L612 228 Q656 226 686 212 L876 216 Q936 224 946 250 L946 300 Z',
    glass: [],
    lines: ['M446 240 L446 292'],
    wheels: [
      { x: 242, r: 55 },
      { x: 782, r: 55 },
    ],
  },
}
