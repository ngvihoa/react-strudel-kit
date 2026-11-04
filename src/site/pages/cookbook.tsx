import source from '../../content/drums.ts?raw'
import tonalSource from '../../content/tonal.ts?raw'
import {
  HI_HAT_DEFAULTS, KICK_DEFAULTS, SNARE_DEFAULTS,
  hiHatAlone, hiHatGroove, kickAlone, kickGroove, snareAlone, snareGroove,
} from '../../content/drums'
import type { HiHatSettings, KickSettings, SnareSettings } from '../../content/drums'
import {
  BASS_DEFAULTS, KEYS_DEFAULTS, LEAD_DEFAULTS, PAD_DEFAULTS,
  bassAlone, bassGroove, keysAlone, keysGroove, leadAlone, leadGroove, padAlone, padGroove,
} from '../../content/tonal'
import type { BassSettings, KeysSettings, LeadSettings, PadSettings } from '../../content/tonal'
import { ROUTES, href } from '../router'
import { SoundArticle } from '../templates'
import type { SoundArticleConfig } from '../templates'

const shared = { crumbs: ['Sound Cookbook', 'Percussion'], source } as const

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
  next: { label: 'Bass', path: ROUTES.bass },
}

const tonal = { crumbs: ['Sound Cookbook', 'Tonal'], source: tonalSource } as const

const BASS: SoundArticleConfig<BassSettings> = {
  ...tonal,
  path: ROUTES.bass,
  title: 'Bass',
  intro: 'A bass is a low note with a shape: how bright it is, and whether it plucks and fades or holds. A sawtooth wave and a low-pass filter give you both.',
  meta: ['Synthesized', 'Sawtooth + filter'],
  defaults: BASS_DEFAULTS,
  controls: [
    { key: 'cutoff', label: 'Cutoff', unit: 'Hz', min: 100, max: 3000, step: 50, hint: ['Round', 'Buzzy'] },
    { key: 'decay', label: 'Decay', unit: 's', min: 0.05, max: 1, step: 0.01, hint: ['Short', 'Long'] },
    { key: 'sustain', label: 'Sustain', unit: 'level', min: 0, max: 1, step: 0.05, hint: ['Pluck', 'Held'] },
  ],
  alone: { title: 'Bass on its own', caption: 'One bar in C at 100 BPM. Change the sliders while it plays.', build: bassAlone, region: 'bass-alone' },
  sound: { region: 'bass-sound', body: <p>A sawtooth has strong overtones above its note. The low-pass filter decides how many
    survive: turn <b>Cutoff</b> down and the bass gets rounder and deeper; up, and it buzzes.</p> },
  anatomy: [
    { part: 'instrument(sawtooth)', unit: '—', role: 'The source: a bright wave with every overtone, so the filter has something to remove.' },
    { part: 'lowPass', unit: 'Hz', role: 'Removes frequencies above the cutoff. The most important control for a bass.' },
    { part: 'decay', unit: 'seconds', role: 'Time to fall from the first peak to the sustain level.' },
    { part: 'sustain', unit: 'level 0–1', role: 'How loud the note stays while it lasts. 0 plucks; 1 holds like an organ.' },
  ],
  callout: { title: 'Decay only matters below full sustain', body: <>With <b>Sustain</b> at 1 there is nothing to decay to, so the
    <b> Decay</b> slider does nothing. Bring sustain down first, then shape the pluck with decay.</> },
  groove: { title: 'Bass and kick', region: 'bass-groove', build: bassGroove,
    body: <p>Your bass with a kick on beats 1 and 3. They start the bar together; on beat 3 the bass rests and lets the kick through.</p> },
  usedIn: [{ label: 'Bass line', path: ROUTES.bassLine }, { label: 'Layer a song', path: ROUTES.layerASong }],
  previous: { label: 'Hi-hat', path: ROUTES.hiHat },
  next: { label: 'Keys', path: ROUTES.keys },
}

const KEYS: SoundArticleConfig<KeysSettings> = {
  ...tonal,
  path: ROUTES.keys,
  title: 'Keys',
  intro: 'Keys are struck notes that fade on their own. A square wave, a filter for brightness and a touch of reverb make a simple electric-organ sound for chords.',
  meta: ['Synthesized', 'Square + reverb'],
  defaults: KEYS_DEFAULTS,
  controls: [
    { key: 'brightness', label: 'Brightness', unit: 'Hz', min: 500, max: 8000, step: 100, hint: ['Muted', 'Bright'] },
    { key: 'decay', label: 'Decay', unit: 's', min: 0.05, max: 1, step: 0.01, hint: ['Staccato', 'Ringing'] },
    { key: 'room', label: 'Room', unit: 'mix', min: 0, max: 0.8, step: 0.05, hint: ['Dry', 'Far'] },
  ],
  alone: { title: 'Keys on their own', caption: 'C major, then A minor, one chord per bar.', build: keysAlone, region: 'keys-alone' },
  sound: { region: 'keys-sound', body: <p>With <code>sustain</code> at 0, every note fades by itself after <b>Decay</b> seconds,
    however long its slot is. That is what makes it sound struck rather than blown.</p> },
  anatomy: [
    { part: 'instrument(square)', unit: '—', role: 'The source: a hollow wave with odd overtones only.' },
    { part: 'lowPass', unit: 'Hz', role: 'Brightness. Lower values sound muted, as if played softly.' },
    { part: 'decay · sustain(0)', unit: 'seconds', role: 'Each note fades to silence on its own timeline.' },
    { part: 'room', unit: '0–1', role: 'How much reverb is mixed in. More sounds farther away.' },
  ],
  callout: { title: 'Chords come from the notes, not the sound', body: <><code>CHORDS.C</code> is three pitches in a
    Mini-Notation <code>stack</code>. Any sound can play it; the keys just make it easy to hear each note.</> },
  groove: { title: 'Keys comping over bass', region: 'keys-groove', build: keysGroove,
    body: <p>Your keys strike each chord on beats 2 and 4 — “comping” — over one bass note per bar.</p> },
  usedIn: [{ label: 'Chords and arpeggios', path: ROUTES.chords }, { label: 'Lo-fi loop', path: ROUTES.lofi }],
  previous: { label: 'Bass', path: ROUTES.bass },
  next: { label: 'Lead', path: ROUTES.lead },
}

const LEAD: SoundArticleConfig<LeadSettings> = {
  ...tonal,
  path: ROUTES.lead,
  title: 'Lead',
  intro: 'A lead carries the melody, so it needs to be heard over everything else. A bright sawtooth, a note-length control and an echo built from the pattern itself.',
  meta: ['Synthesized', 'Sawtooth + echo'],
  defaults: LEAD_DEFAULTS,
  controls: [
    { key: 'cutoff', label: 'Cutoff', unit: 'Hz', min: 500, max: 8000, step: 100, hint: ['Soft', 'Cutting'] },
    { key: 'length', label: 'Note length', unit: '× slot', min: 0.2, max: 1, step: 0.05, hint: ['Staccato', 'Legato'] },
    { key: 'echo', label: 'Echo', unit: 'velocity', min: 0, max: 1, step: 0.05, hint: ['None', 'Strong'] },
  ],
  alone: { title: 'Lead on its own', caption: 'An eight-note phrase in A minor at 100 BPM.', build: leadAlone, region: 'lead-alone' },
  sound: { region: 'lead-sound', body: <p>The echo is not an audio effect. <code>off</code> plays a second copy of the pattern half
    a beat later, and its callback turns that copy down with <code>velocity</code>.</p> },
  anatomy: [
    { part: 'instrument(sawtooth)', unit: '—', role: 'The source: bright and buzzy, so it stands out.' },
    { part: 'clip', unit: '× slot', role: 'How much of its slot each note fills. Lower values leave gaps between notes; the rhythm stays.' },
    { part: 'off(0.125, …)', unit: 'cycles', role: 'Adds a copy shifted by an eighth of a cycle: half a beat in 4/4.' },
    { part: 'velocity (in the copy)', unit: '× gain', role: 'How loud the echo is compared with the original. 0 silences it.' },
  ],
  callout: { title: 'A callback changes only the copy', body: <><code>patternCallback(fn('velocity', 0.35))</code> describes
    what to do to the shifted copy. The original notes keep their full level.</> },
  groove: { title: 'Lead over a pad', region: 'lead-groove', build: leadGroove,
    body: <p>Your lead over a held A minor chord from the Pad page.</p> },
  usedIn: [{ label: 'Layer a song', path: ROUTES.layerASong }, { label: 'House loop', path: ROUTES.house }],
  previous: { label: 'Keys', path: ROUTES.keys },
  next: { label: 'Pad', path: ROUTES.pad },
}

const PAD: SoundArticleConfig<PadSettings> = {
  ...tonal,
  path: ROUTES.pad,
  title: 'Pad',
  intro: 'A pad is a chord that fades in, holds and fades out slowly — a background wash rather than a rhythm. Slow envelopes and a big reverb do most of the work.',
  meta: ['Synthesized', 'Slow envelope + reverb'],
  defaults: PAD_DEFAULTS,
  controls: [
    { key: 'attack', label: 'Attack', unit: 's', min: 0.01, max: 2, step: 0.01, hint: ['Instant', 'Swell'] },
    { key: 'release', label: 'Release', unit: 's', min: 0.1, max: 3, step: 0.05, hint: ['Clipped', 'Trailing'] },
    { key: 'room', label: 'Room', unit: 'mix', min: 0, max: 1, step: 0.05, hint: ['Dry', 'Washed'] },
  ],
  alone: { title: 'Pad on its own', caption: 'C – Am – F – G, one chord per bar at 100 BPM.', build: padAlone, region: 'pad-alone' },
  sound: { region: 'pad-sound', body: <p>A bar at 100 BPM lasts 2.4 seconds. An <b>Attack</b> of a second or more means each chord
    is still swelling when the next one begins — exactly what makes a pad blur into one sound.</p> },
  anatomy: [
    { part: 'attack', unit: 'seconds', role: 'Fade-in time. Long attacks remove the sense of a note starting.' },
    { part: 'sustain(1)', unit: 'level', role: 'Holds full level for the whole chord.' },
    { part: 'release', unit: 'seconds', role: 'Fade-out after the chord ends. Long releases overlap the next chord.' },
    { part: 'room · size', unit: '0–1', role: 'Reverb amount and room size. A big room gives a long tail.' },
  ],
  callout: { title: 'Envelope times are seconds, not beats', body: <>Change the tempo and the attack stays the same length in
    seconds, so a faster song needs a shorter attack to keep the same feel.</> },
  groove: { title: 'Pad under a beat', region: 'pad-groove', build: padGroove,
    body: <p>Your pad under four-on-the-floor kicks and off-beat hi-hats.</p> },
  usedIn: [{ label: 'Chords and arpeggios', path: ROUTES.chords }, { label: 'House loop', path: ROUTES.house }],
  previous: { label: 'Lead', path: ROUTES.lead },
}

export const KickPage = () => <SoundArticle config={KICK} />
export const SnarePage = () => <SoundArticle config={SNARE} />
export const HiHatPage = () => <SoundArticle config={HI_HAT} />
export const BassPage = () => <SoundArticle config={BASS} />
export const KeysPage = () => <SoundArticle config={KEYS} />
export const LeadPage = () => <SoundArticle config={LEAD} />
export const PadPage = () => <SoundArticle config={PAD} />
