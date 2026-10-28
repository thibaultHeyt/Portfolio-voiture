import { ArrowUpRight, MessageCircle, Play, Send } from 'lucide-react'

import { site } from '../../data/site'
import { Lines, Magnetic, Reveal } from './motion'
import { useLocalTime } from './Nav'

const instagram = site.socials.find((social) => social.label === 'Instagram')?.href ?? '#'
const youtube = site.socials.find((social) => social.label === 'YouTube')?.href ?? '#'

/** Pseudo tiré du lien du profil, pour construire l'ouverture du DM. */
const handle = instagram.replace(/\/$/, '').split('/').pop() || 'titou_cars'
const direct = `https://ig.me/m/${handle}`

export function Footer() {
  const time = useLocalTime()

  return (
    <footer id="contact" className="mt-28 scroll-mt-20 border-t border-line sm:mt-40">
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
          <div>
            <Lines
              as="h2"
              className="font-display text-[clamp(46px,7.5vw,112px)] text-fg"
              lines={['On parle', <>voitures<span className="text-accent">?</span></>]}
            />
            <Reveal delay={0.2} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Magnetic>
                <a
                  href={instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-14 items-center gap-2 rounded-[16px] bg-accent px-7 text-[16px] font-medium text-white transition-colors hover:bg-[#f04b3f]"
                >
                  @{handle}
                  <ArrowUpRight className="size-4" />
                </a>
              </Magnetic>
              <a href={youtube} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[14px] text-muted transition-colors hover:text-fg">
                <Play className="size-4" />
                La chaîne YouTube
              </a>
            </Reveal>
            <Reveal delay={0.3} className="mt-6 max-w-sm text-[14px] leading-relaxed text-muted">
              Une voiture à me conseiller, un circuit à découvrir, une question sur une fiche : le plus simple reste le message direct.
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="flex h-full flex-col justify-between gap-10 rounded-card border border-line bg-surface-2/40 p-7 sm:p-9">
              <div>
                <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-faint">
                  <MessageCircle className="size-3.5" />
                  Instagram Direct
                </p>
                <p className="font-display mt-4 text-[clamp(28px,3.2vw,40px)] leading-[1.03] text-fg">
                  Un message,<br />directement<br />dans mes DM.
                </p>
                <p className="mt-4 text-[14px] leading-relaxed text-muted">
                  Le bouton ouvre Instagram Direct sur mon compte : le message s’écrit là-bas, dans la conversation, et je réponds au même endroit.
                </p>
              </div>
              <div>
                <a
                  href={direct}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-[16px] bg-accent text-[15px] font-medium text-white transition-colors hover:bg-[#f04b3f]"
                >
                  <Send className="size-4" />
                  Écrire à @{handle}
                </a>
                <p className="mt-3 text-[12px] leading-relaxed text-faint">
                  Ouvre Instagram, connecté à ton compte (application ou navigateur). Sans compte, le profil reste accessible depuis les liens ci-dessous.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-24 grid gap-8 border-t border-line pt-8 text-[14px] sm:grid-cols-3">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {site.socials.map((social) => (
              <li key={social.label}>
                <a href={social.href} target="_blank" rel="noreferrer" className="link-draw text-muted transition-colors hover:text-fg">
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-faint sm:text-center">
            {site.location}, {time}
          </p>
          <p className="text-faint sm:text-right">
            © {new Date().getFullYear()} {site.name}
          </p>
        </div>
      </div>
    </footer>
  )
}
