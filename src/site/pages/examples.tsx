import { toStrudelCode } from 'react-strudel-kit'
import backbeatSource from '../../content/examples/backbeat.ts?raw'
import fourOnTheFloorSource from '../../content/examples/fourOnTheFloor.ts?raw'
import hiHatAccentsSource from '../../content/examples/hiHatAccents.ts?raw'
import simpleMelodySource from '../../content/examples/simpleMelody.ts?raw'
import bassLineSource from '../../content/examples/bassLine.ts?raw'
import chordsSource from '../../content/examples/chords.ts?raw'
import layerASongSource from '../../content/examples/layerASong.ts?raw'
import lofiSource from '../../content/examples/lofi.ts?raw'
import houseSource from '../../content/examples/house.ts?raw'
import { BASS_LINE } from '../../content/examples/bassLine'
import { CHORD_EXAMPLES } from '../../content/examples/chords'
import { LAYER_A_SONG } from '../../content/examples/layerASong'
import { LOFI } from '../../content/examples/lofi'
import { HOUSE } from '../../content/examples/house'
import { BACKBEAT } from '../../content/examples/backbeat'
import { FOUR_ON_THE_FLOOR, offBeatHats, offBeatHatsRepeat } from '../../content/examples/fourOnTheFloor'
import { HI_HAT_ACCENTS } from '../../content/examples/hiHatAccents'
import { twinkle, twinkleDetached } from '../../content/examples/simpleMelody'
import { EXAMPLES_NAV } from '../navigation'
import { ROUTES } from '../router'
import { CodeBlock } from '../components'
import { sourceRegion } from '../../content/source'
import { ExampleArticle } from '../templates'
import type { ExampleArticleConfig } from '../templates'

const shared = { nav: EXAMPLES_NAV } as const
const TONAL = { bass: { label: 'Bass', path: ROUTES.bass }, keys: { label: 'Keys', path: ROUTES.keys }, lead: { label: 'Lead', path: ROUTES.lead }, pad: { label: 'Pad', path: ROUTES.pad } } as const
const DRUM_SOUNDS = [{ label: 'Kick', path: ROUTES.kick }, { label: 'Snare', path: ROUTES.snare }, { label: 'Hi-hat', path: ROUTES.hiHat }] as const

// Mini-Notation for the `sample` argument only, to compare two ways of writing the same hi-hats.
const hatsNotation = (pattern: typeof offBeatHats) => toStrudelCode(pattern).match(/^s\("([^"]*)"\)/)?.[1] ?? ''

const SIMPLE_MELODY: ExampleArticleConfig = {
  ...shared,
  path: ROUTES.simpleMelody,
  crumbs: ['Examples', 'Basics'],
  title: 'A simple melody',
  intro: '“Twinkle, Twinkle, Little Star”, written bar by bar. Four bars, each its own sequence, played one after another.',
  meta: ['Beginner', 'C major', '100 BPM', '4 bars'],
  source: simpleMelodySource,
  goal: <>Write a melody longer than one bar with <code>sequence</code>, <code>weight</code> and <code>fn('cat', …)</code></>,
  techniques: [<><code>sequence</code> for each bar</>, <><code>weight</code> for held notes</>, <><code>cat</code> for one bar per cycle</>],
  learnFirst: [{ label: 'Your first song', path: ROUTES.firstSong }],
  sections: [
    { id: 'bars', title: 'Write each bar', region: 'bars', player: { title: 'Twinkle, Twinkle', pattern: twinkle }, body: <>
      <p>Each bar is a <code>sequence</code> of four beats. Bars 2 and 4 end on a note that lasts two beats, so it gets
        <code> weight(…, 2)</code> and the bar has three entries instead of four — still four shares in total.</p>
    </> },
    { id: 'melody', title: 'Play the bars in order', region: 'melody', player: { title: 'Twinkle, Twinkle', pattern: twinkle }, body: <>
      <p><code>fn('cat', …)</code> plays its patterns one after another, one per cycle. Four bars take four cycles, then the melody loops.
        Without <code>cat</code>, putting all four bars in one sequence would squeeze them into a single cycle.</p>
    </> },
    { id: 'detached', title: 'Long notes or short ones', region: 'detached', player: { title: 'Detached ending', pattern: twinkleDetached }, body: <>
      <p>The held notes can become a short note followed by silence. The bar keeps four shares, so nothing after it moves —
        compare the two players and listen to the space before bars 3 and 1.</p>
    </> },
  ],
  next: { label: 'Four on the floor', path: ROUTES.fourOnTheFloor },
}

const FOUR_ON_THE_FLOOR_PAGE: ExampleArticleConfig = {
  ...shared,
  path: ROUTES.fourOnTheFloor,
  crumbs: ['Examples', 'Rhythm'],
  title: 'Four on the floor',
  intro: 'A kick on every beat and a hi-hat between each pair: the steady pulse of house and disco.',
  meta: ['Beginner', '120 BPM', '1 bar'],
  source: fourOnTheFloorSource,
  goal: <>Write two rhythms on different grids and play them together with <code>stack</code></>,
  techniques: [<><code>sequence</code> as a grid</>, <><code>rest</code> for off-beats</>, <><code>stack</code> for layering</>, <><code>repeat</code> for figures</>],
  learnFirst: [{ label: 'Your first song', path: ROUTES.firstSong }],
  sounds: DRUM_SOUNDS.filter((sound) => sound.label !== 'Snare'),
  sections: [
    { id: 'kicks', title: 'A kick on every beat', region: 'kicks', player: { title: 'Kicks', pattern: FOUR_ON_THE_FLOOR.kicks }, body: <>
      <p>A rhythm is a grid. Four slots in a bar are four beats, and <code>KICK</code> fills every one. How the kick sounds comes
        from <code>kickSound</code> in the Sound Cookbook; this page only decides when it plays.</p>
    </> },
    { id: 'hats', title: 'Hi-hats between the kicks', region: 'hats', player: { title: 'Off-beat hi-hats', pattern: FOUR_ON_THE_FLOOR.hats }, body: <>
      <p>The hi-hats use a finer grid: eight slots, two per beat. Rests fill the slots that land on a beat, so every hi-hat falls halfway between two kicks.</p>
    </> },
    { id: 'together', title: 'Play both at once', region: 'together', player: { title: 'Four on the floor', pattern: FOUR_ON_THE_FLOOR.together }, body: <>
      <p><code>stack</code> plays its patterns at the same time. Each keeps its own grid: four slots for the kick, eight for the hi-hats, both one bar long.</p>
    </> },
    { id: 'repeat', title: 'A shorter way to write it', region: 'repeat', player: { title: 'With repeat()', pattern: FOUR_ON_THE_FLOOR.repeat }, body: <>
      <p>The hi-hat line is one two-slot figure, rest then hit, four times over. <code>repeat(…, 4)</code> writes it once.</p>
    </>, after: <p className="used-in">Both versions produce the same Mini-Notation timing:
      <code> {hatsNotation(offBeatHats)}</code> and <code>{hatsNotation(offBeatHatsRepeat)}</code>.</p> },
  ],
  previous: { label: 'A simple melody', path: ROUTES.simpleMelody },
  next: { label: 'Backbeat', path: ROUTES.backbeat },
}

const BACKBEAT_PAGE: ExampleArticleConfig = {
  ...shared,
  path: ROUTES.backbeat,
  crumbs: ['Examples', 'Rhythm'],
  title: 'Backbeat',
  intro: 'Kick on 1 and 3, snare on 2 and 4. Add hi-hats and move one kick, and you have the beat behind most pop and rock.',
  meta: ['Beginner', '100 BPM', '1 bar'],
  source: backbeatSource,
  goal: <>Give each drum the grid it needs, and change a groove by moving a single hit</>,
  techniques: [<><code>sequence</code> with <code>rest</code></>, <>Different grids in one <code>stack</code></>],
  learnFirst: [{ label: 'Four on the floor', path: ROUTES.fourOnTheFloor }],
  sounds: DRUM_SOUNDS,
  sections: [
    { id: 'backbeat', title: 'Kick and snare', region: 'backbeat', player: { title: 'Backbeat', pattern: BACKBEAT.backbeat }, body: <>
      <p>Two four-slot grids that take turns: the kick fills slots 1 and 3, the snare 2 and 4. Each rest keeps a beat empty for the other drum.</p>
    </> },
    { id: 'with-hats', title: 'Add hi-hats', region: 'with-hats', player: { title: 'Rock beat', pattern: BACKBEAT.withHats }, body: <>
      <p>Eight hi-hats, two per beat, glue the kick and snare together. <code>repeat(NOISE, 8)</code> fits eight strikes into one slot — here the whole bar.</p>
    </> },
    { id: 'busier-kick', title: 'Move one kick', region: 'busier-kick', player: { title: 'Busier kick', pattern: BACKBEAT.busier }, body: <>
      <p>To place a kick half a beat after beat 3, the kick needs a finer grid. Its eight slots don’t affect the snare, which keeps
        its four. One added hit changes the feel of the whole groove.</p>
    </> },
  ],
  previous: { label: 'Four on the floor', path: ROUTES.fourOnTheFloor },
  next: { label: 'Hi-hat accents', path: ROUTES.hiHatAccents },
}

const HI_HAT_ACCENTS_PAGE: ExampleArticleConfig = {
  ...shared,
  path: ROUTES.hiHatAccents,
  crumbs: ['Examples', 'Rhythm'],
  title: 'Hi-hat accents',
  intro: 'Eight hi-hats at the same volume sound like a machine. A second pattern — how hard each one is struck — brings them to life.',
  meta: ['Intermediate', '100 BPM', '1 bar'],
  source: hiHatAccentsSource,
  goal: <>Control a sound with a pattern of values, and see how its grid lines up with the strikes</>,
  techniques: [<><code>velocity</code> as a control pattern</>, <><code>number</code> values in a sequence</>],
  learnFirst: [{ label: 'Hi-hat', path: ROUTES.hiHat }],
  sounds: DRUM_SOUNDS.filter((sound) => sound.label === 'Hi-hat'),
  sections: [
    { id: 'flat', title: 'No accents', region: 'flat', player: { title: 'Flat hi-hats', pattern: HI_HAT_ACCENTS.flat }, body: <>
      <p>Start from eight identical strikes. Listen for how even, and how flat, it sounds.</p>
    </> },
    { id: 'accented', title: 'Accent the beats', region: 'accented', player: { title: 'Accented', pattern: HI_HAT_ACCENTS.accented }, body: <>
      <p><code>velocity</code> takes a pattern of numbers instead of one value. This one has eight slots, the same as the strikes,
        so each strike gets its own value: full on the beat, about half in between.</p>
    </> },
    { id: 'swell', title: 'A control pattern with its own grid', region: 'swell', player: { title: 'Swell', pattern: HI_HAT_ACCENTS.swell }, body: <>
      <p>The control pattern does not have to match. With four values over eight strikes, each value lasts a beat and covers two
        strikes, so the hi-hats grow louder through the bar. The strikes decide <i>when</i>; the control pattern decides <i>how</i>,
        on its own grid.</p>
    </> },
  ],
  previous: { label: 'Backbeat', path: ROUTES.backbeat },
  next: { label: 'Bass line', path: ROUTES.bassLine },
}

const BASS_LINE_PAGE: ExampleArticleConfig = {
  ...shared,
  path: ROUTES.bassLine,
  crumbs: ['Examples', 'Harmony'],
  title: 'Bass line',
  intro: 'A bass line follows the chords from underneath. Start with one note per chord, give it a rhythm, then lock it to the drums.',
  meta: ['Beginner', 'C major', '100 BPM', '4 bars'],
  source: bassLineSource,
  goal: <>Follow a chord progression with roots and fifths, and reuse a rhythm with a small function</>,
  techniques: [<>Roots and fifths</>, <>A TypeScript function per bar</>, <><code>cat</code> for the progression</>],
  learnFirst: [{ label: 'Backbeat', path: ROUTES.backbeat }],
  sounds: [TONAL.bass, DRUM_SOUNDS[0], DRUM_SOUNDS[1]],
  sections: [
    { id: 'roots', title: 'One note per chord', region: 'roots', player: { title: 'Roots', pattern: BASS_LINE.roots }, body: <>
      <p>The progression is C – Am – F – G, one chord per bar. The simplest bass line plays each chord’s root — the note it is
        named after — once per bar, well below the chords.</p>
    </> },
    { id: 'bar', title: 'Write the rhythm once', region: 'bar', player: { title: 'Roots and fifths', pattern: BASS_LINE.rhythm }, body: <>
      <p>Every bar uses the same rhythm with different notes, so write it as a function. The fifth of a chord sits seven
        semitones above its root and almost always sounds right underneath it.</p>
    </>, after: <CodeBlock source={sourceRegion(bassLineSource, 'rhythm')} pattern={BASS_LINE.rhythm} /> },
    { id: 'with-drums', title: 'Lock it to the drums', region: 'with-drums', player: { title: 'Bass and drums', pattern: BASS_LINE.withDrums }, body: <>
      <p>The kick and snare come straight from the Backbeat example. Importing a part is how a song grows without copying code.</p>
    </> },
  ],
  previous: { label: 'Hi-hat accents', path: ROUTES.hiHatAccents },
  next: { label: 'Chords and arpeggios', path: ROUTES.chords },
}

const CHORDS_PAGE: ExampleArticleConfig = {
  ...shared,
  path: ROUTES.chords,
  crumbs: ['Examples', 'Harmony'],
  title: 'Chords and arpeggios',
  intro: 'The same four chords played two ways: all notes at once, or one note at a time. Then pad, arpeggio and bass together.',
  meta: ['Beginner', 'C major', '100 BPM', '4 bars'],
  source: chordsSource,
  goal: <>Tell <code>stack</code> (at the same time) from <code>sequence</code> (one after another), using the same notes</>,
  techniques: [<>Mini-Notation <code>stack</code> for chords</>, <><code>sequence</code> + <code>repeat</code> for arpeggios</>, <>Layering three parts</>],
  learnFirst: [{ label: 'Bass line', path: ROUTES.bassLine }],
  sounds: [TONAL.keys, TONAL.pad, TONAL.bass],
  sections: [
    { id: 'block', title: 'Block chords', region: 'block', player: { title: 'Block chords', pattern: CHORD_EXAMPLES.block }, body: <>
      <p><code>CHORDS</code> comes from the Sound Cookbook: each chord is three pitches in a Mini-Notation <code>stack</code>,
        which plays them together. One chord per bar with <code>cat</code>.</p>
    </> },
    { id: 'arpeggio', title: 'Arpeggios', region: 'arpeggio', player: { title: 'Arpeggios', pattern: CHORD_EXAMPLES.arpeggio }, body: <>
      <p>Swap <code>stack</code> for <code>sequence</code> and the same notes play one after another. <code>repeat(…, 2)</code> fits
        the four-note figure into the bar twice.</p>
    </> },
    { id: 'together', title: 'Pad, arpeggio and bass', region: 'together', player: { title: 'Harmony', pattern: CHORD_EXAMPLES.together }, body: <>
      <p>Three parts, one progression: a slow pad holds each chord, the arpeggio moves on top, and the roots from the Bass line
        example sit underneath.</p>
    </> },
  ],
  previous: { label: 'Bass line', path: ROUTES.bassLine },
  next: { label: 'Layer a song', path: ROUTES.layerASong },
}

const LAYER_PAGE: ExampleArticleConfig = {
  ...shared,
  path: ROUTES.layerASong,
  crumbs: ['Examples', 'Arrangement'],
  title: 'Layer a song',
  intro: 'Drums, bass, chords and a melody — each written on its own page — stacked into one song and balanced so every part can be heard.',
  meta: ['Intermediate', 'C major', '100 BPM', '4 bars'],
  source: layerASongSource,
  goal: <>Combine finished parts with <code>stack</code> and balance them with <code>velocity</code> and <code>postGain</code></>,
  techniques: [<>Importing parts</>, <><code>stack</code></>, <><code>velocity</code> for balance</>, <><code>postGain</code> for headroom</>],
  learnFirst: [{ label: 'Chords and arpeggios', path: ROUTES.chords }],
  sounds: [...DRUM_SOUNDS, TONAL.bass, TONAL.keys, TONAL.lead],
  sections: [
    { id: 'drums', title: 'Drums', region: 'drums', player: { title: 'Drums', pattern: LAYER_A_SONG.drums }, body: <>
      <p>The kick, snare and hi-hats from the Backbeat example, stacked into one part.</p>
    </> },
    { id: 'melody', title: 'Melody', region: 'melody', player: { title: 'Melody', pattern: LAYER_A_SONG.melody }, body: <>
      <p>A new four-bar tune for the lead sound. Bass and chords are imported from the Harmony examples.</p>
    </> },
    { id: 'together', title: 'Stack and balance', region: 'together', player: { title: 'The song', pattern: LAYER_A_SONG.song }, body: <>
      <p>Stacking parts adds their volumes together. <code>velocity</code> scales each part as a whole, so the arpeggio can sit
        behind the melody without editing its sound. <code>postGain</code> then turns the finished mix down so it doesn’t distort.</p>
    </> },
  ],
  previous: { label: 'Chords and arpeggios', path: ROUTES.chords },
  next: { label: 'Control it with React', path: ROUTES.reactMixer },
}

const LOFI_PAGE: ExampleArticleConfig = {
  ...shared,
  path: ROUTES.lofi,
  crumbs: ['Examples', 'Styles'],
  title: 'Lo-fi loop',
  intro: 'Slow, swung and soft: the same Cookbook sounds with darker settings, seventh chords and a shuffle on the hi-hats.',
  meta: ['Intermediate', 'C major', '80 BPM', '4 bars'],
  source: lofiSource,
  goal: <>Change a style by changing settings and timing, not by writing new sounds</>,
  techniques: [<><code>swingBy</code> for a shuffle</>, <>Overriding sound settings</>, <>Seventh chords</>],
  learnFirst: [{ label: 'Layer a song', path: ROUTES.layerASong }],
  sounds: [...DRUM_SOUNDS, TONAL.keys, TONAL.bass],
  sections: [
    { id: 'swing', title: 'Swing the hi-hats', region: 'swing', player: { title: 'Swung hi-hats', pattern: LOFI.swing }, body: <>
      <p>Straight eighth notes sit exactly halfway through each beat. Swing pushes every second one later, which is most of
        what makes lo-fi feel relaxed.</p>
    </> },
    { id: 'drums', title: 'Softer drums', region: 'drums', player: { title: 'Lazy drums', pattern: LOFI.drums }, body: <>
      <p>The sounds are the Cookbook’s, with a few settings overridden: <code>{'{ ...KICK_DEFAULTS, pitchDrop: 12 }'}</code> keeps
        everything else and changes only what you name.</p>
    </> },
    { id: 'chords', title: 'Seventh chords', region: 'chords', player: { title: 'Jazzy chords', pattern: LOFI.chords }, body: <>
      <p>A seventh chord adds a fourth note to the triad. Dark, roomy keys with a long decay let each chord ring through the bar.</p>
    </> },
    { id: 'together', title: 'The loop', region: 'together', player: { title: 'Lo-fi loop', pattern: LOFI.together }, body: <>
      <p>Drums, chords and a round, low bass at 80 BPM.</p>
    </>, after: <CodeBlock source={sourceRegion(lofiSource, 'bass')} label="The bass" /> },
  ],
  previous: { label: 'Control it with React', path: ROUTES.reactMixer },
  next: { label: 'House loop', path: ROUTES.house },
}

const HOUSE_PAGE: ExampleArticleConfig = {
  ...shared,
  path: ROUTES.house,
  crumbs: ['Examples', 'Styles'],
  title: 'House loop',
  intro: 'Four-on-the-floor at 124 BPM: off-beat bass and hi-hats, chord stabs and a short lead hook.',
  meta: ['Intermediate', 'A minor', '124 BPM', '4 bars'],
  source: houseSource,
  goal: <>Build drive from the off-beats, and let parts of different lengths loop against each other</>,
  techniques: [<>Off-beat rhythms</>, <><code>off</code> for echoes</>, <>A two-bar hook over four-bar chords</>],
  learnFirst: [{ label: 'Four on the floor', path: ROUTES.fourOnTheFloor }],
  sounds: [...DRUM_SOUNDS, TONAL.bass, TONAL.keys, TONAL.lead],
  sections: [
    { id: 'beat', title: 'The beat', region: 'beat', player: { title: 'House beat', pattern: HOUSE.beat }, body: <>
      <p>A kick on every beat, the snare on 2 and 4, and hi-hats on the off-beats. A longer hi-hat decay turns the closed
        tick into an open “tss”.</p>
    </> },
    { id: 'bass', title: 'Off-beat bass', region: 'bass', player: { title: 'Bass with kick', pattern: HOUSE.bass }, body: <>
      <p>The bass never plays on the beat. It answers each kick half a beat later, which keeps the low end from clashing and
        gives house its bounce.</p>
    </> },
    { id: 'stabs', title: 'Chord stabs', region: 'stabs', player: { title: 'Stabs', pattern: HOUSE.stabs }, body: <>
      <p>Short, bright chords on beat 2 of each bar. <code>off(1 / 16, …)</code> adds a softer copy a quarter
        of a beat later, a quick flam.</p>
    </> },
    { id: 'hook', title: 'Hook and loop', region: 'together', player: { title: 'House loop', pattern: HOUSE.together }, body: <>
      <p>The hook is two bars long and the chords four, so the hook plays twice per chord cycle. Parts of different lengths
        loop independently: each <code>cat</code> picks its bar from the cycle count on its own.</p>
      <CodeBlock source={sourceRegion(houseSource, 'hook')} pattern={HOUSE.hook} label="The hook" />
    </> },
  ],
  previous: { label: 'Lo-fi loop', path: ROUTES.lofi },
  next: { label: 'Dance Monkey', path: ROUTES.danceMonkey },
}

export const SimpleMelodyPage = () => <ExampleArticle config={SIMPLE_MELODY} />
export const FourOnTheFloorPage = () => <ExampleArticle config={FOUR_ON_THE_FLOOR_PAGE} />
export const BackbeatPage = () => <ExampleArticle config={BACKBEAT_PAGE} />
export const HiHatAccentsPage = () => <ExampleArticle config={HI_HAT_ACCENTS_PAGE} />
export const BassLinePage = () => <ExampleArticle config={BASS_LINE_PAGE} />
export const ChordsPage = () => <ExampleArticle config={CHORDS_PAGE} />
export const LayerASongPage = () => <ExampleArticle config={LAYER_PAGE} />
export const LofiPage = () => <ExampleArticle config={LOFI_PAGE} />
export const HousePage = () => <ExampleArticle config={HOUSE_PAGE} />
