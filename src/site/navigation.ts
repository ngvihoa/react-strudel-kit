import { AudioLines, BookOpen, Code2, Compass, Music2 } from 'lucide-react'
import { ROUTES } from './router'
import type { NavGroup } from './components'

// Pages without a path are on the roadmap in docs/implementation-plan.md and render as "Soon".
export const LEARN_NAV: readonly NavGroup[] = [
  { title: 'Getting started', items: [
    { label: 'Your first song', path: ROUTES.firstSong, meta: '10 min' },
    { label: 'Make a beat', path: ROUTES.makeBeat },
    { label: 'Add a bass line', path: ROUTES.addBass },
  ] },
  { title: 'Putting it together', items: [
    { label: 'Layer the parts', path: ROUTES.layerParts },
    { label: 'Control it with React', path: ROUTES.controlReact },
  ] },
]

export const COOKBOOK_NAV: readonly NavGroup[] = [
  { title: 'Percussion', items: [
    { label: 'Kick', path: ROUTES.kick },
    { label: 'Snare', path: ROUTES.snare },
    { label: 'Hi-hat', path: ROUTES.hiHat },
  ] },
  { title: 'Tonal', items: [
    { label: 'Bass', path: ROUTES.bass },
    { label: 'Keys', path: ROUTES.keys },
    { label: 'Lead', path: ROUTES.lead },
    { label: 'Pad', path: ROUTES.pad },
  ] },
]

export const EXAMPLES_NAV: readonly NavGroup[] = [
  { title: 'Basics', items: [{ label: 'A simple melody', path: ROUTES.simpleMelody }] },
  { title: 'Rhythm', items: [
    { label: 'Four on the floor', path: ROUTES.fourOnTheFloor },
    { label: 'Backbeat', path: ROUTES.backbeat },
    { label: 'Hi-hat accents', path: ROUTES.hiHatAccents },
  ] },
  { title: 'Harmony', items: [
    { label: 'Bass line', path: ROUTES.bassLine },
    { label: 'Chords and arpeggios', path: ROUTES.chords },
  ] },
  { title: 'Arrangement', items: [{ label: 'Layer a song', path: ROUTES.layerASong }] },
  { title: 'React', items: [{ label: 'Control it with React', path: ROUTES.reactMixer }] },
  { title: 'Styles', items: [
    { label: 'Lo-fi loop', path: ROUTES.lofi },
    { label: 'House loop', path: ROUTES.house },
    { label: 'Dance Monkey', path: ROUTES.danceMonkey, meta: 'Advanced' },
  ] },
]

/** All articles share one navigation tree; URLs stay stable for bookmarks. */
export const DOCS_NAV: readonly NavGroup[] = [
  { title: 'Start here', icon: Compass, items: [
    { label: 'Introduction', path: ROUTES.docs },
    { label: 'Installation', path: ROUTES.installation },
  ] },
  { title: 'Learn', icon: BookOpen, items: LEARN_NAV.flatMap((group) => group.items) },
  { title: 'Sound cookbook', icon: AudioLines, items: COOKBOOK_NAV.flatMap((group) => group.items) },
  { title: 'Examples', icon: Music2, items: EXAMPLES_NAV.flatMap((group) => group.items).map((item) =>
    item.path === ROUTES.reactMixer ? { ...item, label: 'React mixer' } : item) },
  { title: 'Reference', icon: Code2, items: [{ label: 'API reference', path: ROUTES.api }] },
]
