import { ROUTES } from './router'
import type { NavGroup } from './components'

// Pages without a path are on the roadmap in docs/implementation-plan.md and render as "Planned".
export const LEARN_NAV: readonly NavGroup[] = [
  { title: 'Getting started', items: [
    { label: 'Your first song', path: ROUTES.lesson, meta: '5 min' },
    { label: 'Make a beat' },
    { label: 'Add a bass line' },
  ] },
  { title: 'Putting it together', items: [
    { label: 'Layer the parts' },
    { label: 'Control it with React' },
  ] },
]

export const COOKBOOK_NAV: readonly NavGroup[] = [
  { title: 'Percussion', items: [
    { label: 'Kick', path: ROUTES.cookbook, meta: 'Synth' },
    { label: 'Snare' },
    { label: 'Hi-hat' },
  ] },
  { title: 'Tonal', items: [{ label: 'Bass' }, { label: 'Keys' }, { label: 'Lead' }, { label: 'Pad' }] },
]

export const EXAMPLES_NAV: readonly NavGroup[] = [
  { title: 'Basics', items: [{ label: 'One note, four notes' }, { label: 'Long notes and rests' }] },
  { title: 'Rhythm', items: [{ label: 'Four on the floor' }, { label: 'Backbeat snare' }] },
  { title: 'Full songs', items: [{ label: 'Dance Monkey', path: ROUTES.example, meta: 'Advanced' }] },
]
