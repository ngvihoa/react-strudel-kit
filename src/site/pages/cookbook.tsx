import source from '../../content/drums.ts?raw'
import {
  HI_HAT_DEFAULTS, KICK_DEFAULTS, SNARE_DEFAULTS,
  hiHatAlone, hiHatGroove, kickAlone, kickGroove, snareAlone, snareGroove,
} from '../../content/drums'
import type { HiHatSettings, KickSettings, SnareSettings } from '../../content/drums'
import { COOKBOOK_NAV } from '../navigation'
import { ROUTES, href } from '../router'
import { SoundArticle } from '../templates'
import type { SoundArticleConfig } from '../templates'

const shared = { nav: COOKBOOK_NAV, crumbs: ['Sound Cookbook', 'Percussion'], source } as const

const KICK: SoundArticleConfig<KickSettings> = {
  ...shared,
  path: ROUTES.kick,
  title: 'Kick',
  intro: 'A kick is a low sine tone that starts high and drops fast. Two envelopes do the work: one moves the pitch, the other fades the volume.',
  meta: ['Synthesized', 'No samples to download'],
  defaults: KICK_DEFAULTS,
  controls: [
    { key: 'pitchDrop', label: 'Pitch drop', unit: 'st', min: 0, max: 48, step: 1, hint: ['Soft', 'Punchy'] },
    { key: 'pitchTime', label: 'Pitch time', unit: 's', min: 0.01, max: 0.2, step: 0.01, hint: ['Click', 'Boom'] },
    { key: 'decay', label: 'Decay', unit: 's', min: 0.05, max: 0.5, step: 0.01, hint: ['Tight', 'Long'] },
  ],
  alone: { title: 'Kick on its own', caption: 'Four strikes per bar at 100 BPM. Change the sliders while it plays.', build: kickAlone, region: 'kick-alone' },
  sound: { region: 'kick-sound', body: <p>The sound is a list of settings, with no rhythm in it. The sliders feed its three arguments;
    every page that uses this kick gets the same sound.</p> },
  anatomy: [
    { part: 'instrument(sine)', unit: '—', role: 'The source: a pure tone with no overtones, so it reads as a thump rather than a note.' },
    { part: 'pitchEnvelope', unit: 'semitones', role: 'How far above C2 each strike starts. Larger values give more click and punch.' },
    { part: 'pitchDecay', unit: 'seconds', role: 'How fast the pitch falls back to C2. This is the pitch envelope; it does not change loudness.' },
    { part: 'decay · sustain · release', unit: 'seconds', role: 'The amplitude envelope: how fast loudness fades. Separate from the pitch envelope.' },
  ],
  callout: { title: 'Two envelopes, two jobs', body: <>Set <b>Pitch drop</b> to 0 and the kick becomes a plain low note.
    Set <b>Decay</b> long and it rings like a tom. Hearing each one alone is the quickest way to tell them apart.</> },
  groove: { title: 'Kick and hi-hats', region: 'kick-groove', build: kickGroove,
    body: <p>Your kick, with the current slider values, under eighth-note hi-hats.</p> },
  usedIn: [{ label: 'Four on the floor', path: ROUTES.fourOnTheFloor }, { label: 'Backbeat', path: ROUTES.backbeat }],
  next: { label: 'Snare', path: ROUTES.snare },
}

const SNARE: SoundArticleConfig<SnareSettings> = {
  ...shared,
  path: ROUTES.snare,
  title: 'Snare',
  intro: 'A snare is a short burst of noise. White noise contains every frequency at once; two filters choose which part you hear, and a fast envelope cuts it short.',
  meta: ['Synthesized', 'White noise'],
  defaults: SNARE_DEFAULTS,
  controls: [
    { key: 'lowCut', label: 'Low cut', unit: 'Hz', min: 100, max: 4000, step: 50, hint: ['Thick', 'Thin'] },
    { key: 'highCut', label: 'High cut', unit: 'Hz', min: 2000, max: 16000, step: 100, hint: ['Dark', 'Bright'] },
    { key: 'decay', label: 'Decay', unit: 's', min: 0.03, max: 0.4, step: 0.01, hint: ['Snappy', 'Washy'] },
  ],
  alone: { title: 'Snare on its own', caption: 'Beats 2 and 4 at 100 BPM. Change the sliders while it plays.', build: snareAlone, region: 'snare-alone' },
  sound: { region: 'snare-sound', body: <p>There is no note here. The source is the noise itself — <code>NOISE</code>, which the rhythm
    places on the beats — and the sound is the two filters and the envelope that shape it.</p> },
  anatomy: [
    { part: "sample('white')", unit: '—', role: 'The source: random noise with every frequency at equal strength.' },
    { part: 'highPass', unit: 'Hz', role: 'Removes everything below this frequency. Higher values make the snare thinner and less boomy.' },
    { part: 'lowPass', unit: 'Hz', role: 'Removes everything above this frequency. Lower values make it darker and less hissy.' },
    { part: 'decay · sustain · release', unit: 'seconds', role: 'How fast the burst dies away. Short is a crack; long is a wash of noise.' },
  ],
  callout: { title: 'Filters choose a band', body: <>Between <b>Low cut</b> and <b>High cut</b> is the band of noise you hear.
    Push them close together and the snare turns into a narrow, whistly hiss; pull them apart for a full crack.</> },
  groove: { title: 'Kick and snare', region: 'snare-groove', build: snareGroove,
    body: <p>Your snare on beats 2 and 4 against the kick on 1 and 3: the backbeat.</p> },
  usedIn: [{ label: 'Backbeat', path: ROUTES.backbeat }],
  previous: { label: 'Kick', path: ROUTES.kick },
  next: { label: 'Hi-hat', path: ROUTES.hiHat },
}

const HI_HAT: SoundArticleConfig<HiHatSettings> = {
  ...shared,
  path: ROUTES.hiHat,
  title: 'Hi-hat',
  intro: 'A hi-hat is the same white noise as the snare, filtered much higher and cut much shorter. Accents — some strikes louder than others — make it feel played rather than programmed.',
  meta: ['Synthesized', 'White noise'],
  defaults: HI_HAT_DEFAULTS,
  controls: [
    { key: 'lowCut', label: 'Low cut', unit: 'Hz', min: 2000, max: 12000, step: 100, hint: ['Trashy', 'Crisp'] },
    { key: 'decay', label: 'Decay', unit: 's', min: 0.01, max: 0.3, step: 0.005, hint: ['Closed', 'Open'] },
    { key: 'offBeat', label: 'Off-beat level', unit: '×', min: 0.1, max: 1, step: 0.05, hint: ['Accented', 'Even'] },
  ],
  alone: { title: 'Hi-hat on its own', caption: 'Eight strikes per bar at 100 BPM. Change the sliders while it plays.', build: hiHatAlone, region: 'hi-hat-alone' },
  sound: { region: 'hi-hat-sound', body: <p>Compare it with the snare: one high-pass filter instead of two filters, and a decay
    several times shorter. Same source, very different sound.</p> },
  anatomy: [
    { part: "sample('white')", unit: '—', role: 'The same source as the snare.' },
    { part: 'highPass', unit: 'Hz', role: 'Keeps only the top of the noise. Lower values let in more body and grit.' },
    { part: 'decay', unit: 'seconds', role: 'Very short sounds like a closed hi-hat; longer rings like an open one.' },
    { part: 'velocity', unit: '× gain', role: <>Scales each strike: 1 is full, 0.5 is half. Written as its own pattern, so it can accent strikes without changing the sound.</> },
  ],
  callout: { title: 'Accents are a second pattern', body: <>The eight strikes and the eight velocity values are two separate patterns that
    line up. The <a href={href(ROUTES.hiHatAccents)}>Hi-hat accents</a> example shows what happens when they don’t.</> },
  groove: { title: 'Full beat', region: 'hi-hat-groove', build: hiHatGroove,
    body: <p>Your hi-hats, accents included, over the kick and snare from the previous pages.</p> },
  usedIn: [{ label: 'Hi-hat accents', path: ROUTES.hiHatAccents }, { label: 'Four on the floor', path: ROUTES.fourOnTheFloor }, { label: 'Backbeat', path: ROUTES.backbeat }],
  previous: { label: 'Snare', path: ROUTES.snare },
  next: { label: 'Bass' },
}

export const KickPage = () => <SoundArticle config={KICK} />
export const SnarePage = () => <SoundArticle config={SNARE} />
export const HiHatPage = () => <SoundArticle config={HI_HAT} />
