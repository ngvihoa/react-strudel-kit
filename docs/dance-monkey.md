# Dance Monkey playground arrangement

The **Mixer** opens with **Dance Monkey** selected. Press **Play** or
**Ctrl/⌘+Enter**. **Stop** or **Escape** stops the loop. No code editing is needed.

This is a short instrumental arrangement of the chorus, using synthesized
melody, bass, arpeggiated keys, kick, snare and hi-hat. It loops eight 4/4 bars
in about 19.6 seconds. It uses built-in oscillators and noise, with no external
sample banks or vocal recording.

## Play with the arrangement

- **Tempo:** move the BPM slider between 60 and 160.
- **Balance:** change master volume or any part's level.
- **Mute:** remove a part from the mix.
- **Solo:** hear only the selected part(s). Soloing a muted part unmutes it;
  muting a soloed part clears that solo.
- **Sound:** choose triangle, sine, square or sawtooth for melody, bass and keys.
- **Reset mix:** restore the current arrangement's default tempo, volumes,
  mute/solo states and sounds. Playback continues if it is already running.

Controls apply live after Play, and remain editable while stopped without
starting audio. Selecting another arrangement or changing to Code editor
stops playback. Mixer settings are kept across mode changes, and reset on
reload. The separate editor draft is saved locally when storage is available.

Live changes use the running scheduler's next scheduling window; they are not
quantized to bar boundaries. A tempo change can reposition the phrase.

## React and kit integration

The source is [src/songs/danceMonkey.ts](../src/songs/danceMonkey.ts).
Melody, bass, keys, drums, envelopes, output
gain and tempo are built with the kit's typed API. All parts use readable
builders: `pitch`, `rest`, `weight`, `sequence`, `repeat`, `sample` and `number`.
`fn` and `chain` add the sound and playback controls. The arrangement source
does not need any `mini(...)` strings.
`DANCE_MONKEY_PATTERN` is the original fixed arrangement and can be played directly:

```tsx
import { useStrudel } from 'react-strudel-kit/react'
import { DANCE_MONKEY_PATTERN } from './songs/danceMonkey'

export function DanceMonkeyPlayer() {
  const { play, stop } = useStrudel()
  return <>
    <button onClick={() => void play(DANCE_MONKEY_PATTERN)}>Play</button>
    <button onClick={stop}>Stop</button>
  </>
}
```

The interactive [App](../src/App.tsx) maps controls to React state.
[buildMix](../src/mixer.ts) uses those settings and the original typed parts
to build a new `PatternExpression`: track level becomes velocity, selected
parts are stacked, and master output and tempo are added at the end.
It calls `play(pattern)` to begin and `update(pattern)` for running changes.
The library's engine adapter handles serialization internally.

## Reading and editing the melody

`DANCE_MONKEY_MELODY_BARS` is written as eight explicit `sequence(...)` values,
one for each bar. Repeated phrases are written out too, so you can follow the
whole melody in order. The first bar labels all four beats and counts their
durations. You do not need to decode a Mini-Notation string to edit it.

This example divides each 4/4 bar into **16 sixteenth-note units**:

| Expression | What happens | Units in this example |
| --- | --- | --- |
| `pitch('a4')` | Strike A in octave 4 | 1 (a sixteenth note) |
| `weight(pitch('a4'), 2)` | Hold one A for twice that share | 2 (an eighth note) |
| `weight(pitch('a4'), 3)` | Hold one A a little longer | 3 (a dotted eighth note) |
| `weight(pitch('f#4'), 4)` | Hold F-sharp for one beat | 4 (a quarter note) |
| `rest()` | Leave a short silence | 1 |
| `weight(rest(), 4)` | Leave a full beat of silence | 4 |

`weight` is the kit's timing-weight helper: its amount is the **total share**,
not an amount added to the original note. It holds the note rather than striking
it repeatedly. Separate `pitch(...)` entries strike separate notes, even when
their pitches are the same.

For example, here is the complete first bar, laid out one beat per line:

```ts
import { fn, pitch, rest, sequence, weight } from 'react-strudel-kit'

const firstBar = sequence(
  weight(pitch('a4'), 2), pitch('a4'), pitch('a4'),     // Beat 1: 2 + 1 + 1
  weight(pitch('g#4'), 2), pitch('g#4'), pitch('g#4'),  // Beat 2: 2 + 1 + 1
  weight(pitch('g#4'), 2), pitch('f#4'), pitch('f#4'),  // Beat 3: 2 + 1 + 1
  weight(pitch('a4'), 3), pitch('f#4'),                // Beat 4: 3 + 1
)

const melody = fn('note', firstBar) // Accepts the typed sequence directly.
```

To silence beat 4, replace its two entries with `weight(rest(), 4)`. The bar
still totals 16 units, so beats 1–3 keep their timing. In the source, each note
gets its own line and each bar includes a count you can check while editing.

These units are a convention of this score, not an absolute duration built
into `weight`. Strudel divides a sequence's cycle among its relative weights.
Keep a bar's total at 16 when following this example; changing the total also
changes how all its entries fit into the bar. The explicit `fn('cat', ...)`
calls then play bars 1–8 in order, one full cycle each.

## Reading and editing the accompaniment

The other parts follow the same approach: write the musical events, then
use `chain` to give those events a sound. Every sound control has its own
line in the source, so it can be edited independently.

| Part | Rhythm builders | How one 4/4 bar is divided |
| --- | --- | --- |
| Bass | `sequence(pitch(...), rest(), ...)` | Eight equal slots; each is an eighth note |
| Keys | `repeat(sequence(...four pitches...), 2)` | A four-note arpeggio played twice; eight eighth notes |
| Kick | `repeat(pitch('c2'), 4)` | Four quarter-note strikes, on beats 1, 2, 3, 4 |
| Snare | `sequence(rest(), sample('white'), rest(), sample('white'))` | Four quarter-note slots; strikes on beats 2 and 4 |
| Hi-hat | `repeat(sample('white'), 8)` | Eight eighth-note strikes |

The bass and keys each spell out four bars: **F#m → D → E → C#m**.
`DANCE_MONKEY_BASS_BARS` shows every bass note and silence, including the
root and fifth of each chord. `DANCE_MONKEY_KEYS_BARS` shows the four pitches
of each arpeggio. Their explicit `fn('cat', ...)` calls play one bar per cycle;
the four-bar accompaniment loops twice during the eight-bar melody.

`repeat(value, count)` plays the value that many times within its available
time. It strikes again on every repetition. `weight(value, amount)` instead
allocates a longer share to one event. For example, change the kick's repeat
count from `4` to `8` to get eight strikes in the same bar.

These parts do not all use the melody's sixteen-unit counting convention.
Eight equal bass slots divide a bar into eighth notes; four snare slots
divide it into quarter notes. The number of slots and their relative weights
determine the timing within each bar.

### Choosing sounds and shaping them

`pitch('c2')` describes a pitch. `sample('sine')` describes a sound token.
`fn('note', ...)` makes a pitched pattern; `fn('instrument', sample('sine'))`
gives it a sine-wave voice. For unpitched percussion,
`fn('sample', sequence(...))` makes a sound pattern directly. The helper
`sample('white')` selects built-in white noise, without loading a recording.

The source explains each part's sound recipe:

- **Bass:** low sine-wave notes, a low-pass filter at 650 Hz and a short envelope.
- **Keys:** a quiet triangle wave, a fast attack and zero sustain for a plucked
  sound, with pan slightly left and some reverb.
- **Kick:** a low sine wave. `pitchEnvelope` and `pitchDecay` create a quick
  downward pitch sweep; `decay` separately controls how its amplitude fades.
- **Snare:** white noise filtered between low and high cutoffs, with a short
  amplitude decay and zero sustain.
- **Hi-hat:** white noise with a higher high-pass cutoff and a much shorter
  decay than the snare, panned slightly right.

`attack`, `decay` and `release` are times in seconds. `sustain` is an amplitude
level, not a time. `gain` sets the part's level; `lowPass` and `highPass` set
filter cutoff frequencies in Hz. `pan` runs from 0 (left) to 1 (right), with
0.5 at the center. `room` adds reverb. `clip` scales each event's duration
without moving the next onset: `clip(0.6)` leaves a shorter sounding note
within the same rhythmic slot. The melody's setup includes comments walking
through all four stages of the amplitude envelope.

Hi-hat gain is itself a pattern:

```ts
fn('gain', sequence(
  number(0.055), // First half of the bar: four quieter hats.
  number(0.09),  // Second half: four louder hats.
))
```

The two numeric entries each occupy half a bar, independently of the eight
hat strikes. They do **not** alternate volume on every strike. To alternate
quiet/loud on each eighth note instead, use
`repeat(sequence(number(0.055), number(0.09)), 4)` as the gain pattern.

## Musical references

- [Musicnotes leadsheet](https://www.musicnotes.com/sheetmusic/tones-and-i/dance-monkey/MN0202069)
  identifies Toni Watson as the songwriter, F# minor as the original key,
  a 4/4 meter and a tempo of 98 BPM.
- [Popwise teaching score](https://www.popwise.nl/wp-content/uploads/2020/03/Dance-Monkey-Tones-and-I.pdf)
  supplies the chorus melody/rhythm reference (bars 18–25, written in A minor).
  This example transposes that short phrase down three semitones and adds a
  simplified F#m–D–E–C#m accompaniment and synthesized drum arrangement.

The synth timbres and accompaniment are a playground arrangement; they do not
recreate the original recording's vocal performance or production.
