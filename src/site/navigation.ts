import { ROUTES } from './router'
import type { NavGroup } from './components'

// Pages without a path are on the roadmap in docs/implementation-plan.md and render as "Soon".
export const LEARN_NAV: readonly NavGroup[] = [
  { title: 'Getting started', items: [
    { label: 'Your first song', path: ROUTES.firstSong, meta: '10 min' },
    { label: 'Make a beat', path: ROUTES.makeBeat },
    { label: 'Add a bass line' },
  ] },
  { title: 'Putting it together', items: [
    { label: 'Layer the parts' },
    { label: 'Control it with React' },
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
