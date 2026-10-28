import { useEffect, useState } from 'react'

import { site } from '../../data/site'
import { cx } from '../lib/cx'

export function useLocalTime() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: site.timezone }).format(new Date()))
    tick()
    const id = window.setInterval(tick, 15_000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

const links = [
  { href: '#experiences', label: 'Expériences' },
  { href: '#carnet', label: 'Le carnet' },
  { href: '#contact', label: 'Contact' },
]

export function Nav() {
  const time = useLocalTime()
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setHidden(y > last && y > 120)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-40 border-b border-line/80 bg-bg/75 backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        hidden && '-translate-y-full',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8">
        <a href="#top" className="font-display text-[19px] tracking-[-0.02em] text-fg">
          {site.name}
        </a>
        <nav className="flex items-center gap-5 sm:gap-7">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="link-draw text-[13px] text-muted transition-colors hover:text-fg sm:text-[14px]">
              {link.label}
            </a>
          ))}
          <span className="hidden text-[13px] tabular-nums text-faint sm:inline">
            {site.location} {time}
          </span>
        </nav>
      </div>
    </header>
  )
}
