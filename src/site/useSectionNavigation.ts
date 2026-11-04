import { useCallback, useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import type { JSAnimation } from 'animejs'

/** Pin an intentional jump's destination until arrival; scrollspy follows manual scrolling. */
export function useSectionNavigation(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0])
  const current = useRef(ids[0])
  const destination = useRef<string | null>(null)
  const animation = useRef<JSAnimation | null>(null)
  const signature = ids.join('\n')

  const select = useCallback((id: string) => {
    if (current.current === id) return
    current.current = id
    setActive(id)
  }, [])

  useEffect(() => {
    const sections = signature.split('\n').map((id) => document.getElementById(id)).filter((node) => node !== null)
    let frame = 0
    const sync = () => {
      frame = 0
      if (destination.current) return
      const header = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 60
      const visible = sections.filter((node) => node.getClientRects().length > 0)
      if (!visible.length) return
      const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      const section = atEnd ? visible[visible.length - 1] : visible.findLast((node) => node.getBoundingClientRect().top <= header + 32) ?? visible[0]
      select(section.id)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync) }
    const interrupt = () => {
      if (!animation.current) return
      animation.current.cancel()
      animation.current = null
      destination.current = null
      schedule()
    }
    const keydown = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape'].includes(event.key)) interrupt()
    }
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.addEventListener('wheel', interrupt, { passive: true })
    window.addEventListener('touchstart', interrupt, { passive: true })
    window.addEventListener('keydown', keydown)
    return () => {
      cancelAnimationFrame(frame)
      animation.current?.cancel()
      animation.current = null
      destination.current = null
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('wheel', interrupt)
      window.removeEventListener('touchstart', interrupt)
      window.removeEventListener('keydown', keydown)
    }
  }, [signature, select])

  const jump = (id: string, pointer: boolean) => {
    const target = document.getElementById(id)
    if (!target) return
    animation.current?.cancel()
    animation.current = null
    select(id)
    const header = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 60
    const top = Math.max(0, Math.min(target.getBoundingClientRect().top + window.scrollY - header - 24, document.documentElement.scrollHeight - window.innerHeight))
    const reduce = !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !pointer) {
      destination.current = null
      window.scrollTo({ top, behavior: 'instant' })
      return
    }
    destination.current = id
    const scroll = { y: window.scrollY }
    animation.current = animate(scroll, {
      y: top,
      duration: Math.min(900, Math.max(500, Math.abs(top - scroll.y) * 0.15)),
      ease: 'inOut(3)',
      onUpdate: () => window.scrollTo({ top: scroll.y, behavior: 'instant' }),
      onComplete: () => {
        destination.current = null
        animation.current = null
      },
    })
  }

  return { active, jump }
}
