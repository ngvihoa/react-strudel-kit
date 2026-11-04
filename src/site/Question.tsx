import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createTimeline, utils } from 'animejs'
import type { Timeline } from 'animejs'
import { ChevronRight } from 'lucide-react'

/** Keep native disclosure semantics while allowing a closing animation to finish. */
export function Question({ title, children }: { title: string, children: ReactNode }) {
  const details = useRef<HTMLDetailsElement>(null)
  const answer = useRef<HTMLDivElement>(null)
  const chevron = useRef<HTMLSpanElement>(null)
  const expanded = useRef(false)
  const animation = useRef<Timeline | null>(null)

  const finish = () => {
    if (!details.current || !answer.current || !chevron.current) return
    details.current.open = expanded.current
    details.current.style.height = ''
    details.current.style.overflow = ''
    answer.current.style.opacity = ''
    answer.current.style.transform = ''
    answer.current.inert = !expanded.current
    utils.set(chevron.current, { rotate: expanded.current ? 90 : 0 })
  }

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const reduce = () => {
      if (!preference?.matches) return
      animation.current?.cancel()
      animation.current = null
      finish()
    }
    preference?.addEventListener('change', reduce)
    return () => {
      animation.current?.cancel()
      preference?.removeEventListener('change', reduce)
    }
  }, [])

  return <details ref={details} data-reveal-item>
    <summary onClick={(event) => {
      event.preventDefault()
      const element = details.current
      const content = answer.current
      const icon = chevron.current
      if (!element || !content || !icon) return
      const opening = !expanded.current
      const start = element.getBoundingClientRect().height
      const wasClosed = !element.open
      animation.current?.cancel()
      animation.current = null
      expanded.current = opening
      // Keyboard and reduced-motion users get the native, immediate state change.
      if (!event.detail || !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finish()
        return
      }
      if (wasClosed) {
        utils.set(content, { opacity: 0, y: -4 })
        utils.set(icon, { rotate: 0 })
      }
      element.style.height = `${start}px`
      element.style.overflow = 'hidden'
      element.open = true
      content.inert = !opening
      const summary = event.currentTarget.getBoundingClientRect().height
      // A short, measured height animation lets the following questions move naturally.
      animation.current = createTimeline({
        defaults: { duration: opening ? 320 : 240, ease: 'out(3)' },
        onComplete: () => { animation.current = null; finish() },
      })
        .add(element, { height: opening ? summary + content.getBoundingClientRect().height : summary }, 0)
        .add(content, { opacity: opening ? 1 : 0, y: opening ? 0 : -2 }, 0)
        .add(icon, { rotate: opening ? 90 : 0 }, 0)
    }}><span className="question-chevron" ref={chevron} aria-hidden="true"><ChevronRight size={16} /></span>{title}</summary>
    <div className="question-answer" ref={answer}>{children}</div>
  </details>
}
