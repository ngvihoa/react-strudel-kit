import { chain, fn, patternCallback, pitch, rest, sequence } from 'react-strudel-kit'
import type { Pitch } from 'react-strudel-kit'
import {
  HI_HAT_DEFAULTS, KICK, KICK_DEFAULTS, NOISE, SNARE_DEFAULTS, hiHatSound, kickSound, snareSound,
} from '../drums'
import { BASS_DEFAULTS, CHORDS, KEYS_DEFAULTS, LEAD_DEFAULTS, bassSound, keysSound, leadSound } from '../tonal'

const TEMPO = fn('cpm', 31) // 124 BPM ÷ 4 beats per bar.

// #region beat
// Four-on-the-floor kick, clap-like snare on 2 and 4, and open hi-hats on the
// off-beats: the same hi-hat sound with a longer decay.
export const houseBeat = fn('stack',
  chain(fn('note', sequence(KICK, KICK, KICK, KICK)), ...kickSound(KICK_DEFAULTS)),
  chain(fn('sample', sequence(rest(), NOISE, rest(), NOISE)), ...snareSound({ ...SNARE_DEFAULTS, lowCut: 1800, decay: 0.12 })),
  chain(
    fn('sample', sequence(rest(), NOISE, rest(), NOISE, rest(), NOISE, rest(), NOISE)),
    ...hiHatSound({ ...HI_HAT_DEFAULTS, decay: 0.12 }),
  ),
)
// #endregion

// #region bass
// Off-beat bass: the root on every "and", never on the beat with the kick.
const offBeats = (root: Pitch) => sequence(
  rest(), pitch(root), rest(), pitch(root),
  rest(), pitch(root), rest(), pitch(root),
)
export const offBeatBass = chain(
  fn('cat',
    fn('note', offBeats('a1')),
    fn('note', offBeats('f1')),
    fn('note', offBeats('c2')),
    fn('note', offBeats('g1')),
  ),
  ...bassSound({ ...BASS_DEFAULTS, cutoff: 900, decay: 0.12, sustain: 0 }),
)
// #endregion

// #region stabs
// Short chord "stabs", plus a quieter copy a quarter of a beat later (off).
export const chordStabs = chain(
  fn('cat',
    fn('note', sequence(rest(), CHORDS.Am, rest(), rest())),
    fn('note', sequence(rest(), CHORDS.F, rest(), rest())),
    fn('note', sequence(rest(), CHORDS.C, rest(), rest())),
    fn('note', sequence(rest(), CHORDS.G, rest(), rest())),
  ),
  ...keysSound({ ...KEYS_DEFAULTS, brightness: 4000, decay: 0.15 }),
  fn('off', 1 / 16, patternCallback(fn('velocity', 0.5))),
)
// #endregion

// #region hook
// A two-bar lead hook, one bar per cycle, repeating under the four-bar chords.
export const hook = chain(
  fn('cat',
    fn('note', sequence(pitch('e5'), rest(), pitch('e5'), pitch('d5'), rest(), pitch('c5'), pitch('d5'), rest())),
    fn('note', sequence(pitch('c5'), rest(), pitch('a4'), rest(), rest(), rest(), rest(), rest())),
  ),
  ...leadSound({ ...LEAD_DEFAULTS, length: 0.5 }),
)
// #endregion

// #region together
export const houseLoop = chain(
  fn('stack', houseBeat, offBeatBass, chordStabs, hook),
  fn('postGain', 0.75), // Four busy parts: leave headroom.
  fn('cpm', 31),
)
// #endregion

export const HOUSE = {
  beat: chain(houseBeat, TEMPO),
  bass: chain(fn('stack', offBeatBass, chain(fn('note', sequence(KICK, KICK, KICK, KICK)), ...kickSound(KICK_DEFAULTS))), TEMPO),
  stabs: chain(chordStabs, TEMPO),
  hook: chain(hook, TEMPO),
  together: houseLoop,
} as const
