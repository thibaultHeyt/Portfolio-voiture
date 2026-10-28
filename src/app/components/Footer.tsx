import { ArrowUpRight, MessageCircle, Play, Send } from 'lucide-react'
import { useState } from 'react'

import { site } from '../../data/site'
import { Lines, Magnetic, Reveal } from './motion'
import { useLocalTime } from './Nav'

const instagram = site.socials.find((social) => social.label === 'Instagram')?.href ?? '#'
const youtube = site.socials.find((social) => social.label === 'YouTube')?.href ?? '#'

/** Pseudo tiré du lien du profil, pour construire l'ouverture du DM. */
const handle = instagram.replace(/\/$/, '').split('/').pop() || 'titou_cars'
const direct = `https://ig.me/m/${handle}`

// Instagram n'accepte pas de texte prérempli dans une conversation (seul un
// paramètre `ref` existe). Le texte s'écrit donc ici, puis part dans le
// presse-papiers au moment d'ouvrir le DM.
const starter = 'Salut Thibault, je viens de ton site.\n\nJe te contacte à propos de '

/** Copie le message ; le presse-papiers moderne peut être refusé, on retombe
 *  sur la sélection d’un champ caché. */
async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.top = '-1000px'
      document.body.appendChild(area)
      area.select()
      const done = document.execCommand('copy')
      area.remove()
      return done
    } catch {
      return false
    }
  }
}

export function Footer() {
  const time = useLocalTime()
  const [message, setMessage] = useState(starter)
  const [sent, setSent] = useState<'idle' | 'copied' | 'manual'>('idle')

  async function send() {
    const text = message.trim()
    if (!text) return
    setSent((await copy(text)) ? 'copied' : 'manual')
    window.open(direct, '_blank', 'noopener,noreferrer')
  }

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
            <div className="flex h-full flex-col gap-5 rounded-card border border-line bg-surface-2/40 p-6 sm:p-7">
              <div>
                <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-faint">
                  <MessageCircle className="size-3.5" />
                  Instagram Direct
                </p>
                <p className="font-display mt-3 text-[clamp(24px,2.7vw,32px)] leading-[1.05] text-fg">
                  Ton message, prêt à partir.
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">
                  Écris-le ici : au clic, il est copié et Instagram s’ouvre sur notre conversation.
                </p>
              </div>

              <label htmlFor="dm-message" className="sr-only">
                Ton message
              </label>
              <textarea
                id="dm-message"
                value={message}
                rows={5}
                maxLength={900}
                onChange={(event) => {
                  setMessage(event.target.value)
                  setSent('idle')
                }}
                className="w-full resize-none rounded-control border border-line-strong bg-[#0d0a0a] px-4 py-3 text-[14px] leading-relaxed text-fg placeholder:text-faint transition-colors focus:border-accent focus:outline-none"
              />

              <div>
                <button
                  type="button"
                  onClick={send}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-[16px] bg-accent text-[15px] font-medium text-white transition-colors hover:bg-[#f04b3f]"
                >
                  <Send className="size-4" />
                  {sent === 'idle' ? 'Envoyer sur Instagram' : 'Copié, Instagram est ouvert'}
                </button>
                <p aria-live="polite" className="mt-3 text-[11.5px] leading-relaxed text-faint">
                  {sent === 'copied'
                    ? 'Colle le texte dans la conversation (Ctrl/⌘ + V) puis envoie-le : Instagram ne permet pas de préremplir un DM depuis un site.'
                    : sent === 'manual'
                      ? 'Le presse-papiers a refusé : sélectionne ton texte dans le champ ci-dessus, puis colle-le dans Instagram.'
                      : `Ouvre Instagram Direct sur @${handle}, connecté à ton compte. Sans compte, le profil reste accessible depuis les liens ci-dessous.`}
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
