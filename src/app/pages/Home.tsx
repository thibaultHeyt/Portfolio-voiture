import { motion } from 'motion/react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Play } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cars } from '../../data/cars'
import { site, terrains } from '../../data/site'
import { CarStage } from '../components/CarStage'
import { CarViewer } from '../components/CarViewer'
import { TerrainMap } from '../components/TerrainMap'
import { Lines, Magnetic, Reveal } from '../components/motion'
import { cx } from '../lib/cx'

const ease = [0.22, 1, 0.36, 1] as const
const pad = (n: number) => String(n + 1).padStart(2, '0')

export function Home() {
  const [index, setIndex] = useState(0)
  const car = cars[index]
  const go = (step: number) => setIndex((i) => (i + step + cars.length) % cars.length)

  const openCar = (i: number) => {
    setIndex(i)
    document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })
  }

  const openCarSlug = (slug: string) => {
    const found = cars.findIndex((entry) => entry.slug === slug)
    if (found >= 0) openCar(found)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <>
      {/* Hero : la voiture occupe le cadre, le titre passe par-dessus. */}
      <section id="top" className="relative isolate min-h-[100svh] overflow-hidden border-b border-line">
        <HeroField />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, ease }}
          className="pointer-events-none absolute inset-x-0 top-[15%] bottom-[30%] z-0 sm:top-[5%] sm:bottom-[12%]"
        >
          <div className="pointer-events-auto size-full">
            <CarViewer car={car} hero className="size-full" />
          </div>
        </motion.div>

        <div className="relative z-10 flex min-h-[100svh] flex-col justify-between">
          <div className="mx-auto flex w-full max-w-[1400px] items-start justify-between gap-6 px-5 pt-20 text-[11px] uppercase tracking-[0.2em] text-fg/55 sm:px-8 sm:pt-24">
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
              {site.role} · {site.location}
            </motion.p>
            <div className="flex items-center gap-4">
              <span className="font-display tabular-nums text-[13px] text-fg/80">
                {pad(index)} <span className="text-fg/35">/ {pad(cars.length - 1)}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Voiture précédente"
                  className="grid size-10 place-items-center rounded-full border border-line-strong text-fg transition-colors hover:border-accent hover:bg-accent hover:text-white"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Voiture suivante"
                  className="grid size-10 place-items-center rounded-full border border-line-strong text-fg transition-colors hover:border-accent hover:bg-accent hover:text-white"
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[1400px] px-5 pb-5 sm:px-8 sm:pb-6">
            <div className="flex items-end justify-end gap-4">
              <motion.div
                key={car.slug}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease }}
                className="text-right"
              >
                <p className="text-[10px] tracking-[0.22em] text-fg/45 uppercase">{car.marque}</p>
                <p className="font-display text-[clamp(20px,3vw,34px)] leading-none text-white">{car.modele}</p>
                {car.preview ? (
                  <a
                    href="#experiences"
                    className="mt-1.5 inline-flex items-center gap-1 text-[9px] tracking-[0.18em] text-accent/85 uppercase transition-colors hover:text-accent"
                  >
                    La fiche
                    <ArrowDown className="size-3" />
                  </a>
                ) : null}
              </motion.div>
            </div>

            <Lines
              as="h1"
              className="font-display mt-2 text-[clamp(40px,7vw,104px)] text-fg"
              lines={[
                'Chaque voiture,',
                <>
                  une <span className="text-accent">leçon</span>.
                </>,
              ]}
            />

            <div className="mt-4 grid gap-4 border-t border-line pt-3 sm:grid-cols-[1.4fr_1fr] sm:items-end">
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5, ease }}>
                <p className="max-w-xl text-pretty text-[15px] leading-relaxed text-muted sm:text-[17px]">{site.intro.split('. ')[0]}.<span className="hidden sm:inline"> {site.intro.split('. ').slice(1).join('. ')}</span>
                  <span className="sm:hidden"> {site.intro.split('. ')[1]?.split(',')[0]}.</span></p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.65, ease }}
                className="flex flex-wrap items-center gap-3 sm:justify-end"
              >
                <a
                  href="https://www.instagram.com/titou_cars"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center rounded-[13px] border border-line-strong px-4 text-[13px] text-fg transition-colors hover:border-accent hover:text-accent"
                >
                  @titou_cars
                </a>
                <a
                  href={site.socials[1].href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="grid size-11 place-items-center rounded-[13px] border border-line-strong text-fg transition-colors hover:border-accent hover:text-accent"
                >
                  <Play className="size-4" />
                </a>
                <Magnetic>
                  <a
                    href="#experiences"
                    className="group inline-flex h-11 items-center gap-2 rounded-[13px] bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#f04b3f]"
                  >
                    Les expériences
                    <ArrowDown className="size-4 transition-transform duration-500 group-hover:translate-y-0.5" />
                  </a>
                </Magnetic>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b border-line py-5" aria-hidden>
        <ul className="font-display flex w-max animate-marquee items-center gap-8 whitespace-nowrap text-[24px] text-fg/60 hover:[animation-play-state:paused] sm:text-[32px]">
          {[...site.marquee, ...site.marquee].map((item, i) => (
            <li key={i} className="flex items-center gap-8">
              {item}
              <span className="round size-1.5 rounded-full bg-accent" />
            </li>
          ))}
        </ul>
      </div>

      <CarStage index={index} onChange={setIndex} />

      <section id="carnet" className="mx-auto max-w-[1400px] scroll-mt-20 px-5 pt-24 sm:px-8 sm:pt-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Lines as="h2" className="font-display text-[clamp(38px,6vw,72px)] text-fg" lines={['Le carnet']} />
          <Reveal className="max-w-sm text-pretty text-[14px] leading-relaxed text-muted">
            Ce que j'ai conduit, sur quel terrain, et la phrase que je garde de chaque expérience.
          </Reveal>
        </div>

        <ul className="mt-12 border-t border-line">
          {cars.map((item, i) => (
            <motion.li
              key={item.slug}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.6, delay: i * 0.04, ease }}
              className="border-b border-line"
            >
              <button
                type="button"
                data-cursor="Lire"
                onClick={() => openCar(i)}
                className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 py-6 text-left sm:grid-cols-[auto_1fr_auto_auto] sm:gap-x-8"
              >
                <span className={cx('text-[12px] tabular-nums transition-colors', i === index ? 'text-accent' : 'text-faint')}>{pad(i)}</span>
                <span className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-display truncate text-[clamp(26px,4vw,44px)] text-fg transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">
                    {item.marque}
                  </span>
                  <span className="truncate text-[15px] text-muted sm:text-[17px]">{item.modele}</span>
                </span>
                <span className="hidden text-[13px] text-muted sm:block">{item.terrain}</span>
                <span className="flex items-center gap-3 justify-self-end text-[13px] text-muted">
                  <span className="hidden max-w-[240px] truncate lg:inline">{item.appris}</span>
                  <ArrowUpRight className="size-4 -translate-x-1 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      </section>

      <Terrains onOpenCar={openCarSlug} />
    </>
  )
}

// Champs de couleur lents derrière le hero : le rouge de l'accent, un corail
// sombre et une braise, floutés et en dérive, qui se fondent dans le noir.
function HeroField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_65%,transparent_97%)]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, ease }} className="absolute inset-0">
        <div className="round absolute -top-[30%] right-[-12%] h-[95%] w-[68%] animate-drift-a rounded-full bg-[radial-gradient(closest-side,rgb(224_54_44/0.5),transparent)] blur-3xl" />
        <div className="round absolute -top-[14%] left-[-14%] h-[80%] w-[62%] animate-drift-b rounded-full bg-[radial-gradient(closest-side,rgb(120_20_14/0.75),transparent)] blur-3xl" />
        <div className="round absolute top-[20%] left-[28%] h-[70%] w-[56%] animate-drift-c rounded-full bg-[radial-gradient(closest-side,rgb(255_110_70/0.24),transparent)] blur-3xl" />
        <div className="round absolute top-[48%] right-[8%] h-[52%] w-[42%] animate-drift-b rounded-full bg-[radial-gradient(closest-side,rgb(94_16_12/0.6),transparent)] blur-3xl" />
      </motion.div>
      <div className="grain absolute inset-0 opacity-[0.12]" />
    </div>
  )
}

/** Module « terrains » : une carte interactive des circuits et des routes,
 *  avec la fiche du lieu et la voiture qui y était. */
function Terrains({ onOpenCar }: { onOpenCar: (slug: string) => void }) {
  const circuits = terrains.filter((terrain) => terrain.kind === 'Circuit').length
  const countries = new Set(terrains.map((terrain) => terrain.country)).size
  const laps = terrains.reduce((total, terrain) => total + (terrain.laps ?? 0), 0)

  const stats = [
    { value: String(circuits), label: 'circuits' },
    { value: String(countries), label: 'pays' },
    { value: String(laps), label: 'tours bouclés' },
  ]

  return (
    <section id="terrains" className="relative scroll-mt-20 border-t border-line bg-[#070606] py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="text-[12px] uppercase tracking-[0.22em] text-faint">Les terrains</p>
            <Lines as="h2" className="font-display mt-2 text-[clamp(38px,6vw,76px)] text-fg" lines={['Là où ça', 's’est passé.']} />
          </div>
          <Reveal className="max-w-sm text-pretty text-[14px] leading-relaxed text-muted">
            Cinq circuits — trois dans le Sud-Ouest, l'Allemagne, la Belgique — et les routes qui relient tout ça. Un point, une session.
          </Reveal>
        </div>

        <TerrainMap onOpenCar={onOpenCar} />

        <div className="mt-8 grid w-full max-w-2xl grid-cols-3 gap-4 border-y border-line py-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display tabular-nums text-[clamp(26px,3.4vw,40px)] leading-none text-fg">{stat.value}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-faint">{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[12px] text-faint">
          Mérignac, le karting de location et Haute-Saintonge au sud de Bordeaux, le reste plus loin.
        </p>
      </div>
    </section>
  )
}
