import { AnimatePresence, animate, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { cars } from '../../data/cars'
import { site } from '../../data/site'
import { preloadModels } from '../lib/carModels'

const EASE = [0.4, 0, 0.2, 1] as const
const TICKS = 40
const MIN_MS = 1200

/**
 * Écran de chargement piloté par le chargement réel : polices, images, puis
 * téléchargement des huit modèles 3D (le rail suit leur progression réelle),
 * pour que le hero affiche directement la bonne voiture. Aucun faux compte à
 * rebours, mais un plancher de temps pour que l'animation reste lisible sur une
 * bonne connexion.
 *
 * Le composant ne se monte pas si `prefers-reduced-motion` est actif : la page
 * s'affiche directement (et les modèles se chargent à la demande).
 */
export function Preloader() {
  const [show, setShow] = useState(shouldShow)
  const [display, setDisplay] = useState(0)
  const [status, setStatus] = useState('Préparation')
  const [ticker, setTicker] = useState(0)
  const current = useRef(0)
  const stop = useRef<(() => void) | null>(null)

  // Défilement des noms de voitures pendant l'attente.
  useEffect(() => {
    if (!show) return
    const id = window.setInterval(() => setTicker((n) => (n + 1) % cars.length), 800)
    return () => window.clearInterval(id)
  }, [show])

  useEffect(() => {
    if (!show) return
    document.body.style.overflow = 'hidden'
    let cancelled = false

    const goTo = (target: number, duration: number) => {
      stop.current?.()
      const controls = animate(current.current, target, {
        duration,
        ease: EASE,
        onUpdate: (v) => {
          current.current = v
          setDisplay(Math.round(v))
        },
      })
      stop.current = () => controls.stop()
    }

    const started = performance.now()
    const steps: Array<{
      label: string
      /** Plafond de temps : une étape ne peut jamais bloquer le chargement. */
      cap: number
      run: (onProgress: (fraction: number) => void) => Promise<unknown>
    }> = [
      { label: 'Polices', cap: 5000, run: () => document.fonts.ready },
      {
        label: 'Images',
        // Les vignettes `loading="lazy"` ne sont pas chargées tant qu'elles
        // sont hors écran — et l'overlay les cache. `decode()` n'y répondrait
        // jamais : on ne décode que les images déjà chargées.
        cap: 5000,
        run: () =>
          Promise.all(
            Array.from(document.images)
              .filter((img) => img.loading !== 'lazy' || img.complete)
              .map((img) => img.decode().catch(() => undefined)),
          ),
      },
      {
        label: 'Voitures 3D',
        // Les huit GLB pèsent 33 Mo une fois compressés en Draco : au-delà de
        // 20 s on ouvre la page quand même, et le reste se charge en fond.
        cap: 20000,
        run: (onProgress) => Promise.all([preloadModels(onProgress), waitForScene(3500)]),
      },
    ]

    void (async () => {
      for (let i = 0; i < steps.length; i++) {
        if (cancelled) return
        const from = (i / steps.length) * 100
        const to = ((i + 1) / steps.length) * 100
        setStatus(steps[i].label)
        // La dernière étape peut être longue : c'est la progression réelle du
        // préchargement qui fait avancer le compteur, pas un minuteur.
        const slow = i === steps.length - 1
        goTo(from + (to - from) * (slow ? 0.04 : 0.6), 0.4)

        let active = true
        await Promise.race([
          steps[i]
            .run((fraction) => {
              if (cancelled || !active) return
              goTo(from + (to - from) * Math.max(0.04, Math.min(0.96, fraction)), 0.35)
            })
            .catch(() => undefined),
          delay(steps[i].cap),
        ])
        active = false
        if (cancelled) return
        goTo(to, 0.45)
      }

      const left = Math.max(0, MIN_MS - (performance.now() - started))
      await delay(left)
      if (cancelled) return
      goTo(100, 0.35)
      setStatus('Prêt')
      await delay(420)
      if (cancelled) return
      setShow(false)
    })()

    return () => {
      cancelled = true
      stop.current?.()
      document.body.style.overflow = ''
    }
  }, [show])

  const filled = `inset(0 ${100 - display}% 0 0)`

  return (
    <AnimatePresence onExitComplete={() => (document.body.style.overflow = '')}>
      {show && (
        <motion.div
          key="preloader"
          data-loader
          role="status"
          aria-live="polite"
          aria-label="Chargement du site"
          className="fixed inset-0 z-[100] bg-[#080707] text-fg"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="grain absolute inset-0 opacity-[0.16]" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.4 }}
              className="round absolute -right-[18%] -bottom-[32%] size-[78vw] rounded-full bg-[radial-gradient(closest-side,rgb(224_54_44/0.28),transparent)] blur-3xl"
            />
          </div>

          <motion.div
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="relative flex h-full flex-col justify-between p-6 sm:p-10"
          >
            <div className="flex items-start justify-between gap-6">
              <p className="font-display text-[20px] sm:text-[24px]">{site.name}</p>
              <p className="text-right text-[10px] leading-relaxed tracking-[0.22em] text-faint uppercase">
                {site.location}
                <br />
                {site.kicker}
              </p>
            </div>

            <div className="pb-2">
              {/* Rail gradué : les segments s'allument avec la progression. */}
              <div aria-hidden className="relative flex h-8 items-end gap-[3px] sm:h-11">
                {Array.from({ length: TICKS }, (_, i) => (
                  <span key={i} className="h-full flex-1 rounded-[1px] bg-fg/10" />
                ))}
                <div style={{ clipPath: filled }} className="absolute inset-x-0 bottom-0 flex h-full items-end gap-[3px]">
                  {Array.from({ length: TICKS }, (_, i) => (
                    <span key={i} className="h-full flex-1 rounded-[1px] bg-accent" />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
                <div className="flex items-start">
                  <span className="font-display tabular-nums text-[clamp(64px,15vw,176px)] leading-[0.8]">
                    {String(display).padStart(3, '0')}
                  </span>
                  <span className="font-display mt-1 ml-1 text-[18px] text-accent sm:mt-2 sm:text-[26px]">%</span>
                </div>

                <div className="pb-2 text-right">
                  <p className="text-[10px] tracking-[0.22em] text-faint uppercase">Au volant de</p>
                  <div className="h-7 overflow-hidden sm:h-9">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.p
                        key={cars[ticker].slug}
                        initial={{ y: 18, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -18, opacity: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="font-display text-[18px] text-fg/85 sm:text-[24px]"
                      >
                        {cars[ticker].marque} {cars[ticker].modele}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="relative h-px w-full bg-line">
                <div style={{ width: `${display}%` }} className="absolute inset-y-0 left-0 bg-accent" />
              </div>
              <div className="mt-4 flex items-center justify-between text-[10px] tracking-[0.22em] uppercase">
                <span className="text-muted">{status}</span>
                <span className="text-faint">© {new Date().getFullYear()}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function shouldShow() {
  if (typeof window === 'undefined') return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

/** Attend le premier rendu de la scène 3D, avec un plafond pour ne jamais bloquer. */
function waitForScene(timeout: number) {
  return new Promise<void>((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      window.removeEventListener('scene:ready', finish)
      resolve()
    }
    window.addEventListener('scene:ready', finish)
    window.setTimeout(finish, timeout)
  })
}
