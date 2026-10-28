import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'

/**
 * Curseur maison : un point qui colle au pointeur, un anneau qui le suit avec
 * un temps de retard et une lueur rouge en arrière-plan. Il s'agrandit au-dessus
 * des éléments interactifs et affiche l'étiquette portée par `data-cursor`.
 *
 * Désactivé au doigt et quand `prefers-reduced-motion` est actif : dans ce cas
 * le curseur système reste en place.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false)
  const [active, setActive] = useState(false)
  const [label, setLabel] = useState<string | null>(null)

  const x = useMotionValue(-200)
  const y = useMotionValue(-200)
  const dotX = useSpring(x, { stiffness: 900, damping: 55, mass: 0.2 })
  const dotY = useSpring(y, { stiffness: 900, damping: 55, mass: 0.2 })
  const ringX = useSpring(x, { stiffness: 240, damping: 26, mass: 0.5 })
  const ringY = useSpring(y, { stiffness: 240, damping: 26, mass: 0.5 })
  const glowX = useSpring(x, { stiffness: 70, damping: 22, mass: 0.9 })
  const glowY = useSpring(y, { stiffness: 70, damping: 22, mass: 0.9 })

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setEnabled(fine.matches && !reduce.matches)
    sync()
    fine.addEventListener('change', sync)
    reduce.addEventListener('change', sync)
    return () => {
      fine.removeEventListener('change', sync)
      reduce.removeEventListener('change', sync)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('has-cursor')

    const move = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
    }
    const over = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      const interactive = target?.closest<HTMLElement>('a, button, [data-cursor]') ?? null
      setActive(Boolean(interactive))
      setLabel(interactive?.dataset.cursor ?? null)
    }
    const leave = () => {
      x.set(-200)
      y.set(-200)
      setActive(false)
      setLabel(null)
    }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      document.removeEventListener('pointerleave', leave)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[95]">
      <motion.div style={{ x: glowX, y: glowY }} className="round absolute -top-40 -left-40 size-80 rounded-full bg-accent/15 blur-3xl" />

      <motion.div style={{ x: ringX, y: ringY }} className="absolute top-0 left-0">
        <motion.div
          animate={{ scale: active ? 1.6 : 1, opacity: active ? 1 : 0.7 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="round absolute -top-[22px] -left-[22px] size-11 rounded-full border border-accent/70 bg-accent/5 backdrop-blur-[1px]"
        />
        <AnimatePresence>
          {label && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[30px] left-1/2 -translate-x-1/2 rounded-full border border-line-strong bg-bg/80 px-2.5 py-1 text-[9px] tracking-[0.16em] whitespace-nowrap text-fg/80 uppercase backdrop-blur-md"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div style={{ x: dotX, y: dotY }} className="round absolute -top-[3px] -left-[3px] size-1.5 rounded-full bg-accent" />
    </div>
  )
}
