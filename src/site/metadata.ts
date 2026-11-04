import { ROUTES } from './router'
import type { RoutePath } from './router'

export const SITE_URL = 'https://react-strudel-kit.vercel.app'
export const SITE_NAME = 'React Strudel Kit'
export const SOCIAL_IMAGE = `${SITE_URL}/og-image.png`
const IMAGE_ALT = 'React Strudel Kit — Write music in TypeScript. Play it with React.'

type PageInfo = { name: string, description: string }

// Exhaustive so a new public route cannot silently inherit the home page's metadata.
export const PAGE_INFO = {
  [ROUTES.home]: { name: 'Typed music patterns for React', description: 'Write music in TypeScript and play it with React. Explore typed Strudel patterns, a shared playback hook, live examples and step-by-step lessons.' },
  [ROUTES.docs]: { name: 'Introduction', description: 'Meet React Strudel Kit: typed pattern composition, Mini-Notation helpers and React playback. Find the right lesson, sound recipe or API reference.' },
  [ROUTES.installation]: { name: 'Installation', description: 'Install react-strudel-kit in a React app. Check compatibility, copy a working component and play your first typed Strudel pattern with useStrudel.' },
  [ROUTES.firstSong]: { name: 'Your first song', description: 'Learn to play notes, build sequences, shape rhythm with rests and weights, and set the tempo. Listen and change each pattern as you go.' },
  [ROUTES.makeBeat]: { name: 'Make a beat', description: 'Build a drum groove with synthesized kick, snare and hi-hat patterns. Layer rhythms, move hits and adjust off-beat accents in a live practice mix.' },
  [ROUTES.addBass]: { name: 'Add a bass line', description: 'Add bass roots and fifths to a four-chord progression. Reuse a rhythm, combine it with drums and balance the parts with interactive controls.' },
  [ROUTES.layerParts]: { name: 'Layer the parts', description: 'Arrange drums, bass, arpeggios and melody with typed Strudel patterns. Explore phrase lengths and balance foreground and background parts.' },
  [ROUTES.controlReact]: { name: 'Control music with React', description: 'Connect React state to musical patterns with useStrudel. Build Play, Stop, tempo and mute controls, update live playback and handle errors.' },
  [ROUTES.kick]: { name: 'Kick sound recipe', description: 'Make a synthesized kick with a sine wave and pitch envelope. Hear how pitch drop, pitch decay and amplitude decay shape the sound.' },
  [ROUTES.snare]: { name: 'Snare sound recipe', description: 'Build a snare from filtered white noise. Adjust its low cut, high cut and decay, then hear the sound inside a drum groove.' },
  [ROUTES.hiHat]: { name: 'Hi-hat sound recipe', description: 'Shape a hi-hat from high-pass filtered white noise. Explore short decay and off-beat accents with playable typed Strudel examples.' },
  [ROUTES.bass]: { name: 'Bass sound recipe', description: 'Create a filtered sawtooth bass. Adjust cutoff, decay and sustain, then hear how the sound fits a bass line and drum groove.' },
  [ROUTES.keys]: { name: 'Keys sound recipe', description: 'Design a plucked keys sound with a filtered square wave. Explore brightness, decay and reverb in playable chords and accompaniment.' },
  [ROUTES.lead]: { name: 'Lead sound recipe', description: 'Build a sawtooth lead with a filter and a quieter delayed copy. Adjust cutoff, note length and echo in interactive melody examples.' },
  [ROUTES.pad]: { name: 'Pad sound recipe', description: 'Make a soft synth pad with slow attack, long release and reverb. Hear how its envelope changes held chords and melodic accompaniment.' },
  [ROUTES.simpleMelody]: { name: 'Simple melody example', description: 'Explore a playable melody built from typed notes, rests, weights and sequences. Inspect the source and the exact generated Strudel code.' },
  [ROUTES.fourOnTheFloor]: { name: 'Four-on-the-floor example', description: 'Create a kick on every beat and hi-hats between the beats. Compare typed rhythm patterns and hear them with built-in synthesized sounds.' },
  [ROUTES.backbeat]: { name: 'Backbeat example', description: 'Play a kick on beats one and three, a snare on two and four, and eight hi-hats. Move a kick to explore a busier drum pattern.' },
  [ROUTES.hiHatAccents]: { name: 'Hi-hat accents example', description: 'Use velocity patterns to accent hi-hats without changing their timing. Compare alternating accents and gradual swells with live playback.' },
  [ROUTES.bassLine]: { name: 'Bass line example', description: 'Follow chord roots, add fifths and combine a bass line with kick and snare. Explore the typed pattern source and generated Strudel output.' },
  [ROUTES.chords]: { name: 'Chords and arpeggios example', description: 'Compare block chords and arpeggios over C, Am, F and G. Learn how stacked notes and sequences change harmony into accompaniment.' },
  [ROUTES.layerASong]: { name: 'Layer a song example', description: 'Combine reusable drums, bass, chord arpeggios and melody into one arrangement. Inspect each layer and the complete typed Strudel source.' },
  [ROUTES.reactMixer]: { name: 'React mixer example', description: 'Try a working React mixer with Play, Stop, tempo and part controls. Read the component source and learn how state updates a running pattern.' },
  [ROUTES.lofi]: { name: 'Lo-fi loop example', description: 'Explore a synthesized lo-fi loop with swung hi-hats, soft jazzy chords and a round bass. Play each part and inspect the complete arrangement.' },
  [ROUTES.house]: { name: 'House loop example', description: 'Play a house loop with four-on-the-floor drums, off-beat bass, chord stabs and a lead hook. Explore the source of each musical layer.' },
  [ROUTES.danceMonkey]: { name: 'Dance Monkey arrangement', description: 'Explore a typed Strudel arrangement of Dance Monkey. Play its musical parts, inspect source-backed patterns and see how the layers fit together.' },
  [ROUTES.api]: { name: 'API reference', description: 'Reference for typed composition, Mini-Notation helpers, serializers and useStrudel. Find function arguments, playback behavior and working examples.' },
  [ROUTES.playground]: { name: 'Music playground', description: 'Experiment with a React Strudel mixer and code editor. Play synthesized arrangements, adjust parts and tempo, or write your own musical pattern.' },
} satisfies Record<RoutePath, PageInfo>

export type HeadTag = { tag: 'meta' | 'link' | 'script', attributes: Record<string, string>, text?: string }
export const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')

export function getMetadata(route: RoutePath | null) {
  const page = route === null ? { name: 'Page not found', description: 'This page could not be found. Explore the React Strudel Kit documentation, lessons and playable examples.' } : PAGE_INFO[route]
  const title = route === ROUTES.home ? `${SITE_NAME} — ${page.name}` : `${page.name} | ${SITE_NAME}`
  const url = route === null ? null : `${SITE_URL}${route}`
  const preview = import.meta.env.VITE_DEPLOY_ENV === 'preview'
  const robots = route === null || preview ? 'noindex, follow' : 'index, follow, max-image-preview:large'
  const tags: HeadTag[] = []
  const meta = (key: string, content: string, property = false) => tags.push({ tag: 'meta', attributes: { [property ? 'property' : 'name']: key, content } })
  meta('description', page.description)
  meta('robots', robots)
  if (url) tags.push({ tag: 'link', attributes: { rel: 'canonical', href: url } })
  meta('og:site_name', SITE_NAME, true)
  meta('og:type', route === ROUTES.home || route === ROUTES.playground || route === null ? 'website' : 'article', true)
  meta('og:title', title, true)
  meta('og:description', page.description, true)
  if (url) meta('og:url', url, true)
  meta('og:image', SOCIAL_IMAGE, true)
  meta('og:image:type', 'image/png', true)
  meta('og:image:width', '1200', true)
  meta('og:image:height', '630', true)
  meta('og:image:alt', IMAGE_ALT, true)
  meta('twitter:card', 'summary_large_image')
  meta('twitter:title', title)
  meta('twitter:description', page.description)
  meta('twitter:image', SOCIAL_IMAGE)
  meta('twitter:image:alt', IMAGE_ALT)

  if (url) {
    const website = { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: SITE_NAME, url: `${SITE_URL}/`, inLanguage: 'en' }
    const entity = route === ROUTES.home ? {
      '@type': 'SoftwareSourceCode', name: 'react-strudel-kit', description: page.description, url,
      codeRepository: 'https://github.com/ngvihoa/react-strudel-kit', programmingLanguage: 'TypeScript',
      license: 'https://www.gnu.org/licenses/agpl-3.0.html',
    } : {
      '@type': route === ROUTES.playground ? 'WebPage' : 'TechArticle', headline: page.name,
      description: page.description, url, inLanguage: 'en', isPartOf: { '@id': website['@id'] },
    }
    const crumbs = [{ name: 'Home', item: `${SITE_URL}/` }]
    if (route !== ROUTES.home) {
      if (route !== ROUTES.docs && route !== ROUTES.playground) crumbs.push({ name: 'Introduction', item: `${SITE_URL}${ROUTES.docs}` })
      crumbs.push({ name: page.name, item: url })
    }
    const breadcrumb = { '@type': 'BreadcrumbList', itemListElement: crumbs.map((crumb, index) => ({ '@type': 'ListItem', position: index + 1, ...crumb })) }
    const graph = route === ROUTES.home ? [website, entity] : [website, entity, breadcrumb]
    tags.push({ tag: 'script', attributes: { type: 'application/ld+json' }, text: safeJson({ '@context': 'https://schema.org', '@graph': graph }) })
  }
  return { title, description: page.description, url, robots, tags }
}

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Shared by static HTML and the client; social crawlers do not need JavaScript. */
export function renderMetadata(route: RoutePath | null) {
  const { title, tags } = getMetadata(route)
  return `<title>${escapeHtml(title)}</title>\n` + tags.map(({ tag, attributes, text }) => {
    const attrs = Object.entries(attributes).map(([key, value]) => `${key}="${escapeHtml(value)}"`).join(' ')
    return tag === 'script' ? `<script data-seo ${attrs}>${text}</script>` : `<${tag} data-seo ${attrs}>`
  }).join('\n')
}
