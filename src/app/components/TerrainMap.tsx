import { ArrowUpRight, RotateCcw, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'

import { cars } from '../../data/cars'
import { MAP_HEIGHT, MAP_WIDTH, mapCountries, project } from '../../data/mapGeo'
import { terrains, type Terrain } from '../../data/site'
import { cx } from '../lib/cx'

const ease = [0.22, 1, 0.36, 1] as const
const ZOOM = 2.9
const pad = (n: number) => String(n + 1).padStart(2, '0')
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** Le point de départ des trajets. */
const HUB = project(-0.6, 44.84)

const places = terrains.map((terrain, index) => {
  const [lat, lon] = terrain.coord
  const [x, y] = project(lon, lat)
  return { terrain, index, x, y }
})

const isRemote = (x: number, y: number) => Math.hypot(x - HUB[0], y - HUB[1]) > 30

/** Courbe entre deux points, bombée perpendiculairement pour lire un trajet. */
function curve([x1, y1]: [number, number], [x2, y2]: [number, number]) {
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.hypot(dx, dy) || 1
  const bend = length * 0.14
  const cx = (x1 + x2) / 2 - (dy / length) * bend
  const cy = (y1 + y2) / 2 + (dx / length) * bend
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

const countries = [
  { name: 'France', at: project(2.1, 46.4) },
  { name: 'Espagne', at: project(-2.4, 43.2) },
  { name: 'Allemagne', at: project(8.4, 50.3) },
  { name: 'Belgique', at: project(4.4, 50.7) },
  { name: 'Suisse', at: project(8.0, 46.7) },
]

/** Marge autour de la carte, pour que les points des bords restent entiers. */
const PAD = 44
const BOX = { width: MAP_WIDTH + PAD * 2, height: MAP_HEIGHT + PAD * 2 }
const percent = (value: number, total: number) => `${((value + PAD) / total) * 100}%`
const px = (value: number) => percent(value, BOX.width)
const py = (value: number) => percent(value, BOX.height)
/** Position bornée : le point reste à 16 px du bord, donc toujours cliquable. */
const bounded = (value: string) => `clamp(16px, ${value}, calc(100% - 16px))`

/** Rayon (en unités de carte) sous lequel les points sont regroupés :
 *  Mérignac, le karting et les départementales sont à quelques kilomètres. */
const CLUSTER = 40

// Le regroupement se calcule sur la position réelle, pas sur le point décalé.
const near = places.filter((place) => Math.hypot(place.x - HUB[0], place.y - HUB[1]) < CLUSTER)
const far = places.filter((place) => Math.hypot(place.x - HUB[0], place.y - HUB[1]) >= CLUSTER)

export function TerrainMap({ onOpenCar }: { onOpenCar?: (slug: string) => void }) {
  const [active, setActive] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [cluster, setCluster] = useState(false)

  const zoomed = active !== null || cluster
  const scale = zoomed ? ZOOM : 1
  const focus = active !== null ? places[active] : cluster ? { x: HUB[0], y: HUB[1] } : null

  const tx = clamp(MAP_WIDTH / 2 - scale * (focus ? focus.x : MAP_WIDTH / 2), MAP_WIDTH - scale * MAP_WIDTH, 0)
  const ty = clamp(MAP_HEIGHT / 2 - scale * (focus ? focus.y : MAP_HEIGHT / 2), MAP_HEIGHT - scale * MAP_HEIGHT, 0)

  const close = () => {
    setActive(null)
    setCluster(false)
  }

  const screen = (x: number, y: number) => [x * scale + tx, y * scale + ty] as const

  const routes = useMemo(
    () => places.filter((place) => isRemote(place.x, place.y)).map((place) => ({ index: place.index, d: curve(HUB, [place.x, place.y]) })),
    [],
  )

  const selected = active === null ? null : places[active].terrain
  const car = selected?.car ? cars.find((entry) => entry.slug === selected.car) : undefined
  const hub = screen(HUB[0], HUB[1])
  // Les trois lieux de Bordeaux se choisissent dans la liste qui s'ouvre au
  // clic sur le groupe : à cette échelle, leurs points se chevauchent.
  const shown = active !== null ? places : far

  return (
    <div className="mt-12 grid gap-5 lg:grid-cols-[1.45fr_1fr] lg:items-stretch">
      <div className="relative min-w-0">
        <div className="relative overflow-hidden rounded-card border border-accent/20 bg-[radial-gradient(120%_90%_at_50%_0%,rgb(224_54_44/0.07),transparent_65%)]">
          <svg
            viewBox={`${-PAD} ${-PAD} ${BOX.width} ${BOX.height}`}
            className="block h-auto w-full"
            role="group"
            aria-label="Carte des circuits et des routes parcourus"
          >
            {/* Fond transparent : seules les lignes portent la carte. */}
            <rect x={-PAD} y={-PAD} width={BOX.width} height={BOX.height} fill="transparent" onClick={close} />

            <g
              style={{
                transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
                transformOrigin: '0 0',
                transition: 'transform 750ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {/* Graticule : repères fins, sans fond. */}
              <g stroke="rgb(224 54 44 / 0.10)" strokeWidth={0.6} vectorEffect="non-scaling-stroke">
                {[-2, 0, 2, 4, 6, 8].map((lon) => {
                  const [x] = project(lon, 50)
                  return <line key={`lon-${lon}`} x1={x} y1={0} x2={x} y2={MAP_HEIGHT} />
                })}
                {[44, 46, 48, 50].map((lat) => {
                  const [, y] = project(2, lat)
                  return <line key={`lat-${lat}`} x1={0} y1={y} x2={MAP_WIDTH} y2={y} />
                })}
              </g>

              {/* Les pays : contours rouges, remplissage à peine perceptible. */}
              <g>
                {mapCountries.map((country) => (
                  <path
                    key={country.code}
                    d={country.d}
                    fill="rgb(224 54 44 / 0.05)"
                    stroke="rgb(224 54 44 / 0.45)"
                    strokeWidth={1}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </g>

              {/* Les trajets, en pointillés qui défilent. */}
              <g fill="none" strokeLinecap="round">
                {routes.map((route) => (
                  <path
                    key={route.index}
                    d={route.d}
                    stroke="rgb(224 54 44 / 0.5)"
                    strokeWidth={1.4}
                    strokeDasharray="4 7"
                    vectorEffect="non-scaling-stroke"
                    className={cx('animate-dash', active !== null && active !== route.index && 'opacity-40')}
                    style={{ transition: 'opacity 400ms' }}
                  />
                ))}
              </g>

            </g>
          </svg>

          {/* Points, noms et repères en HTML : leur taille ne dépend pas du
              cadrage de la carte, donc ils restent lisibles et cliquables. */}
          <div className="pointer-events-none absolute inset-0" aria-hidden={false}>
            <div className="absolute inset-0 transition-opacity duration-300" style={{ opacity: zoomed ? 0 : 1 }} aria-hidden={zoomed}>
              {countries.map((country) => (
                <span
                  key={country.name}
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-[8px] uppercase tracking-[0.22em] text-accent/55 sm:text-[10px]"
                  style={{ left: px(country.at[0]), top: py(country.at[1]) }}
                >
                  {country.name}
                </span>
              ))}
            </div>

            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 text-accent/70"
              style={{ left: px(hub[0]), top: py(hub[1]) }}
              aria-hidden
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="9" cy="9" r="6" strokeOpacity="0.4" />
                <path d="M9 3.5v11M3.5 9h11" strokeOpacity="0.8" />
              </svg>
            </span>

            {!zoomed && near.length > 1 && (
              <button
                type="button"
                onClick={() => setCluster(true)}
                aria-label={`${near.length} lieux autour de Bordeaux : ${near.map((place) => place.terrain.name).join(', ')}`}
                className="group pointer-events-auto absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-accent/60 bg-[#070606]/85 text-accent backdrop-blur transition-colors hover:border-accent hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                style={{ left: bounded(px(HUB[0])), top: bounded(py(HUB[1])) }}
              >
                <span className="text-[11px] font-medium tabular-nums leading-none">{near.length}</span>
                <span className="pointer-events-none absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#070606]/90 px-1.5 py-0.5 text-[10px] leading-none text-accent opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  Bordeaux
                </span>
              </button>
            )}

            {cluster && active === null && (
              <div
                className="pointer-events-auto absolute w-[188px] -translate-x-1/2 -translate-y-full rounded-[14px] border border-accent/40 bg-[#0b0808]/95 p-2 shadow-[0_18px_40px_rgb(0_0_0/0.55)] backdrop-blur-md"
                style={{ left: px(hub[0]), top: py(hub[1]), marginTop: -14 }}
              >
                <p className="px-2 pb-1.5 pt-1 text-[9px] uppercase tracking-[0.2em] text-accent/70">Bordeaux</p>
                {near.map((place) => (
                  <button
                    key={place.terrain.name}
                    type="button"
                    onClick={() => setActive(place.index)}
                    className="flex w-full items-baseline justify-between gap-2 rounded-[9px] px-2 py-1.5 text-left text-[12px] text-muted transition-colors hover:bg-accent/10 hover:text-fg"
                  >
                    <span className="truncate">{place.terrain.name}</span>
                    <span className="shrink-0 tabular-nums text-[10px] text-faint">{place.terrain.measure}</span>
                  </button>
                ))}
              </div>
            )}

            {shown.map((place) => {
              const [x, y] = screen(place.x, place.y)
              // Un point sorti du cadre au zoom ne s'entasse pas sur le bord.
              if (zoomed && (x < -PAD * 0.5 || y < -PAD * 0.5 || x > MAP_WIDTH + PAD * 0.5 || y > MAP_HEIGHT + PAD * 0.5)) return null
              const isActive = active === place.index
              const isHover = hover === place.index
              return (
                <button
                  key={place.terrain.name}
                  type="button"
                  aria-label={`${place.terrain.name} — ${place.terrain.region}`}
                  aria-pressed={isActive}
                  onClick={() => setActive(place.index)}
                  onMouseEnter={() => setHover(place.index)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(place.index)}
                  onBlur={() => setHover(null)}
                  className="group pointer-events-auto absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"                    style={{ left: bounded(px(x)), top: bounded(py(y)) }}
                >
                  {isActive && <span className="absolute size-9 rounded-full bg-accent/20" />}
                  <span
                    className={cx(
                      'relative block rounded-full transition-all duration-200',
                      isActive
                        ? 'size-3.5 border-2 border-fg bg-accent'
                        : isHover
                          ? 'size-3 bg-accent ring-2 ring-accent/30'
                          : 'size-2.5 bg-accent/80 ring-2 ring-[#070606]',
                    )}
                  />
                  <span
                    className={cx(
                      'pointer-events-none absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#070606]/90 px-1.5 py-0.5 text-[10px] leading-none transition-opacity',
                      isActive ? 'text-fg opacity-100' : 'text-accent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
                    )}
                  >
                    {place.terrain.name}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 text-[9px] uppercase tracking-[0.18em] text-accent/60 sm:text-[10px]">
            <span className="inline-flex items-center gap-2">
              <svg width="22" height="6" aria-hidden>
                <line x1="0" y1="3" x2="22" y2="3" stroke="rgb(224 54 44 / 0.7)" strokeWidth="1.4" strokeDasharray="3 4" />
              </svg>
              Trajets depuis Bordeaux
            </span>
            <span className="tabular-nums">{places.length} lieux</span>
          </div>

          <AnimatePresence>
            {zoomed && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                onClick={close}
                className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-[#0b0808]/80 px-3 py-1.5 text-[11px] text-fg/80 backdrop-blur transition-colors hover:border-accent hover:text-fg"
              >
                <RotateCcw className="size-3" />
                Vue d’ensemble
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Sur mobile, la fiche se pose sur la carte : pas besoin de faire défiler. */}
        <AnimatePresence>
          {selected && car !== undefined && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="absolute inset-x-2 bottom-2 z-10 max-h-[64%] overflow-y-auto rounded-card lg:hidden"
            >
              <PlaceCard terrain={selected} car={car} onClose={() => setActive(null)} onOpenCar={onOpenCar} compact />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="hidden lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:gap-4">
        <AnimatePresence mode="wait">
          {selected && car !== undefined && (
            <motion.div
              key={selected.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease }}
            >
              <PlaceCard terrain={selected} car={car} onClose={() => setActive(null)} onOpenCar={onOpenCar} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex min-h-0 flex-1 flex-col rounded-card border border-line bg-surface-2/25 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-faint">Les lieux</p>
            <p className="text-[10px] tabular-nums text-faint">{places.length}</p>
          </div>
          {!selected && (
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
              Un point sur la carte, et sa session s’affiche ici : le lieu, la mesure, et la voiture qui y était.
            </p>
          )}
          <ul className="mt-3 flex-1 space-y-0.5 overflow-y-auto">
            {places.map((place) => (
              <li key={place.terrain.name}>
                <button
                  type="button"
                  onClick={() => setActive(place.index)}
                  onMouseEnter={() => setHover(place.index)}
                  onMouseLeave={() => setHover(null)}
                  aria-pressed={active === place.index}
                  className={cx(
                    'flex w-full items-baseline justify-between gap-3 rounded-[10px] px-2 py-1.5 text-left text-[13px] transition-colors',
                    active === place.index
                      ? 'bg-accent/15 text-fg'
                      : hover === place.index
                        ? 'bg-accent/10 text-fg'
                        : 'text-muted hover:text-fg',
                  )}
                >
                  <span className="flex items-baseline gap-2 truncate">
                    <span className="tabular-nums text-[10px] text-accent/60">{pad(place.index)}</span>
                    <span className="truncate">{place.terrain.name}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-[11px] text-faint">{place.terrain.measure}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function PlaceCard({
  terrain,
  car,
  onClose,
  onOpenCar,
  compact,
}: {
  terrain: Terrain
  car: (typeof cars)[number]
  onClose: () => void
  onOpenCar?: (slug: string) => void
  compact?: boolean
}) {
  return (
    <div
      className={cx(
        'relative flex flex-col rounded-card border border-accent/25 bg-[#0b0808]/92 backdrop-blur-md',
        compact ? 'p-4' : 'p-6',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-accent">{terrain.region}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fiche du lieu"
          className="-mr-1 -mt-1 rounded-full p-1.5 text-faint transition-colors hover:text-fg"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <h3 className={cx('font-display mt-2 leading-none text-fg', compact ? 'text-[24px]' : 'text-[clamp(26px,3vw,38px)]')}>
        {terrain.name}
      </h3>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em]">
        <span className="rounded-full border border-accent/40 px-2.5 py-1 text-accent">{terrain.kind}</span>
        <span className="rounded-full border border-line-strong px-2.5 py-1 tabular-nums text-fg/70">{terrain.measure}</span>
        <span className="text-faint">{terrain.country}</span>
      </div>

      <p className={cx('mt-4 text-pretty leading-relaxed text-muted', compact ? 'text-[12.5px]' : 'text-[13.5px]')}>{terrain.note}</p>

      <div className="mt-auto border-t border-line pt-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-faint">Au volant</p>
        <p className="font-display mt-1 text-[18px] leading-tight text-fg">
          {car.marque} {car.modele}
        </p>
        <p className="mt-1.5 text-[12.5px] italic leading-relaxed text-accent/90">« {car.appris} »</p>
        {onOpenCar && (
          <button
            type="button"
            onClick={() => onOpenCar(car.slug)}
            className="mt-3 inline-flex items-center gap-1 text-[12px] text-fg/80 underline decoration-accent/50 underline-offset-4 transition-colors hover:text-accent"
          >
            Voir la fiche 3D
            <ArrowUpRight className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
