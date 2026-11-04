import { useLayoutEffect, useRef } from 'react'
import { animate, createScope, stagger, utils } from 'animejs'

/** Anime.js owns transient styles; scope cleanup handles routes, Strict Mode and preference changes. */
export function useLandingMotion() {
  const root = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const element = root.current
    if (!element) return
    const groups = Array.from(element.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!window.matchMedia || typeof IntersectionObserver === 'undefined') return

    const scope = createScope({ root, mediaQueries: { reduced: '(prefers-reduced-motion: reduce)' } }).add((self) => {
      if (!self) return
      if (self.matches.reduced) {
        element.dataset.heroState = 'static'
        groups.forEach((group) => { group.dataset.revealState = 'static' })
        return
      }
      element.dataset.heroState = 'revealing'
      animate('[data-hero-reveal]', {
        opacity: [0, 1],
        y: [20, 0],
        duration: 1100,
        delay: stagger(110, { start: 100 }),
        ease: 'out(3)',
        onComplete: () => { element.dataset.heroState = 'visible' },
      })

      const record = animate('.session-record', {
        rotate: [0, 360], duration: 16000, ease: 'linear', loop: true, autoplay: false,
      })
      const player = element.querySelector('.session-listen .player')
      const syncRecord = () => { if (player?.classList.contains('player-playing')) record.resume(); else record.pause() }
      const playback = new MutationObserver(syncRecord)
      if (player) playback.observe(player, { attributes: true, attributeFilter: ['class'] })
      syncRecord()

      const targets = (group: HTMLElement) => {
        const children = Array.from(group.querySelectorAll<HTMLElement>('[data-reveal-item]'))
        return children.length ? children : [group]
      }
      const reveal = (group: HTMLElement) => {
        if (group.dataset.revealState !== 'pending') return
        group.dataset.revealState = 'revealing'
        self.execute(() => animate(targets(group), {
          opacity: [0, 1],
          y: [18, 0],
          duration: 900,
          delay: stagger(90),
          ease: 'out(3)',
          onComplete: () => { group.dataset.revealState = 'visible' },
        }))
      }
      groups.forEach((group) => {
        group.dataset.revealState = 'pending'
        utils.set(targets(group), { opacity: 0, y: 18 })
      })
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          reveal(entry.target as HTMLElement)
          observer.unobserve(entry.target)
        })
      }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' })
      groups.forEach((group) => observer.observe(group))
      const focus = (event: FocusEvent) => {
        if (!(event.target instanceof Element)) return
        const group = event.target.closest<HTMLElement>('[data-reveal]')
        if (group) reveal(group)
      }
      element.addEventListener('focusin', focus)
      return () => {
        observer.disconnect()
        playback.disconnect()
        element.removeEventListener('focusin', focus)
      }
    })
    return () => scope.revert()
  }, [])
  return root
}
