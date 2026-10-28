import { ArrowLeft, ArrowRight, Info, Play, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { cars } from '../../data/cars'
import { asset } from '../lib/asset'
import { cx } from '../lib/cx'
import { CarGlyph } from './CarGlyph'
import { CarViewer } from './CarViewer'

const ease = [0.22, 1, 0.36, 1] as const
const pad = (n: number) => String(n + 1).padStart(2, '0')

// Angle des aperçus (`public/models/previews`) et zoom du cadrage recadré :
// la scène lancée au clic démarre exactement sur l'image affichée.
const PREVIEW_ANGLE = 3.9
const PREVIEW_ZOOM = 1.12

/** Le détail de l'expérience : chiffres, citation, récit, fiche technique et
 *  sélecteur. L'aperçu lance la scène 3D sur place, au clic. */
export function CarStage({ index, onChange }: { index: number; onChange: (index: number) => void }) {
  const count = cars.length
  const car = cars[index]
  const go = (step: number) => onChange((index + step + count) % count)
  const [live, setLive] = useState(false)

  // Changer de voiture referme la scène : l'aperçu reprend la main.
  useEffect(() => setLive(false), [car.slug])

  return (
    <section
      id="experiences"
      className="relative scroll-mt-16 overflow-hidden border-b border-line bg-[#070606] py-16 sm:py-24"
      aria-roledescription="carrousel"
      aria-label="Les voitures et ce qu'elles m'ont appris"
    >
      <motion.div
        aria-hidden
        animate={{ backgroundColor: car.tint }}
        transition={{ duration: 1, ease }}
        className="pointer-events-none absolute -top-52 left-[6%] size-[560px] rounded-full opacity-15 blur-[160px]"
      />

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[12px] uppercase tracking-[0.22em] text-faint">Expériences</p>
            <h2 className="font-display mt-2 text-[clamp(34px,5vw,62px)] text-fg">Au volant</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display mr-2 tabular-nums text-[15px] text-faint">
              {pad(index)} <span className="text-fg/25">/ {pad(count - 1)}</span>
            </span>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Voiture précédente"
              className="grid size-12 place-items-center rounded-[14px] border border-line-strong text-fg transition-colors hover:border-accent hover:bg-accent hover:text-white"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Voiture suivante"
              className="grid size-12 place-items-center rounded-[14px] border border-line-strong text-fg transition-colors hover:border-accent hover:bg-accent hover:text-white"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        <figure className="relative mt-10 aspect-4/3 overflow-hidden rounded-[24px] border border-line bg-[#0b0909] sm:aspect-[16/9]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={car.slug}
              src={car.preview ? asset(car.preview) : undefined}
              alt={`${car.marque} ${car.modele}`}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease }}
              className="absolute inset-0 size-full object-cover"
            />
          </AnimatePresence>

          {live ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, ease }}
              className="absolute inset-0 bg-[#0b0909]"
            >
              <CarViewer car={car} className="size-full" initialAngle={PREVIEW_ANGLE} zoom={PREVIEW_ZOOM} />
            </motion.div>
          ) : (
            <button
              type="button"
              onClick={() => setLive(true)}
              data-cursor="Lancer la 3D"
              aria-label={`Faire tourner la ${car.marque} ${car.modele} en 3D`}
              className="absolute inset-0 cursor-pointer"
            />
          )}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(6,5,5,0.82),rgba(6,5,5,0.06)_52%,transparent)]"
          />

          <figcaption className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 sm:inset-x-6 sm:bottom-5">
            <span>
              <span className="block text-[10px] tracking-[0.18em] text-white/50 uppercase">{car.categorie}</span>
              <span className="font-display block text-[clamp(18px,2.2vw,26px)] leading-tight text-white">
                {car.marque} {car.modele}
              </span>
            </span>
            {live ? (
              <button
                type="button"
                onClick={() => setLive(false)}
                className="pointer-events-auto inline-flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-black/45 px-4 py-2.5 text-[12px] font-medium text-white backdrop-blur-md transition-colors hover:border-white/40 hover:bg-black/65"
              >
                Fermer
                <X className="size-3.5" />
              </button>
            ) : (
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-[12px] font-medium text-white">
                <Play className="size-3" />
                Lancer la 3D
              </span>
            )}
          </figcaption>
        </figure>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={car.slug}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease }}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[12px] uppercase tracking-[0.22em] text-faint">Fiche {pad(index)}</p>
                  <p className="text-[12px] text-faint">{car.categorie}</p>
                </div>

                <h3 className="font-display mt-3 text-[clamp(38px,5.4vw,64px)] text-fg">
                  {car.marque}
                  <span className="block text-fg/40">{car.modele}</span>
                </h3>
                {car.modele3d ? (
                  <p className="mt-4 flex max-w-xl items-start gap-2 text-[12.5px] leading-relaxed text-accent/90">
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    <span>{car.modele3d}</span>
                  </p>
                ) : null}
                <p className="mt-5 max-w-xl text-pretty text-[16px] leading-relaxed text-muted sm:text-[18px]">{car.tagline}</p>

                <div className="mt-8 grid grid-cols-3 gap-3 border-y border-line py-6">
                  {car.chiffres.map((chiffre) => (
                    <div key={chiffre.label}>
                      <p className="font-display tabular-nums text-[clamp(26px,3.4vw,44px)] leading-none text-fg">
                        {chiffre.value}
                        <span className="ml-1 text-[0.42em] tracking-[0.08em] text-faint">{chiffre.unit}</span>
                      </p>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-faint">{chiffre.label}</p>
                    </div>
                  ))}
                </div>

                <blockquote className="mt-8 border-l-2 border-accent pl-5">
                  <p className="font-display text-[clamp(22px,2.6vw,30px)] leading-tight text-fg">« {car.appris} »</p>
                </blockquote>

                <div className="mt-6 space-y-4 text-pretty text-[15px] leading-relaxed text-muted">
                  {car.recit.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.16em] text-faint">
                  <span>{car.terrain}</span>
                  {car.annee ? <span className="text-fg/25">/</span> : null}
                  {car.annee ? <span>{car.annee}</span> : null}
                  {car.credit ? (
                    <>
                      <span className="text-fg/25">/</span>
                      <a
                        href={car.credit.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="normal-case tracking-normal underline decoration-fg/20 underline-offset-2 transition-colors hover:text-fg/80"
                      >
                        Modèle 3D : {car.credit.label}
                      </a>
                    </>
                  ) : null}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="self-start lg:sticky lg:top-24">
            <p className="text-[11px] uppercase tracking-[0.2em] text-faint">Fiche technique</p>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 text-[13px]">
              {car.specs.map((spec) => (
                <div key={spec.label} className="border-t border-line pt-2">
                  <dt className="text-faint">{spec.label}</dt>
                  <dd className="mt-1 text-fg/90">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-16 border-t border-line pt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-faint">Toutes les voitures</p>
            <p className="font-display tabular-nums text-[12px] text-faint">
              {pad(index)} <span className="text-fg/25">/ {pad(count - 1)}</span>
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {cars.map((item, i) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => onChange(i)}
                aria-pressed={i === index}
                data-cursor="Voir"
                className={cx(
                  'group relative overflow-hidden rounded-[16px] border text-left transition-colors duration-300',
                  i === index ? 'border-accent/70 bg-accent/5' : 'border-line hover:border-line-strong hover:bg-white/[0.03]',
                )}
              >
                <span className="relative block overflow-hidden">
                  {item.preview ? (
                    <img
                      src={asset(item.preview)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={cx(
                        'aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.03]',
                        i === index ? 'opacity-100' : 'opacity-75 group-hover:opacity-100',
                      )}
                    />
                  ) : (
                    <CarGlyph art={item.art} className="aspect-[16/10] w-full opacity-90" />
                  )}
                  <span className="absolute top-2 left-2 rounded-full border border-white/15 bg-black/50 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-white/75 backdrop-blur-md">
                    {item.terrain}
                  </span>
                </span>

                <span className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <span className="font-display truncate text-[13px] text-fg sm:text-[14px]">
                    {item.marque} {item.modele}
                  </span>
                  <span className="shrink-0 text-[10px] tabular-nums text-faint">{pad(i)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
