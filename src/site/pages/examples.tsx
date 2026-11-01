import { toStrudelCode } from 'react-strudel-kit'
import backbeatSource from '../../content/examples/backbeat.ts?raw'
import fourOnTheFloorSource from '../../content/examples/fourOnTheFloor.ts?raw'
import hiHatAccentsSource from '../../content/examples/hiHatAccents.ts?raw'
import simpleMelodySource from '../../content/examples/simpleMelody.ts?raw'
import { BACKBEAT } from '../../content/examples/backbeat'
import { FOUR_ON_THE_FLOOR, offBeatHats, offBeatHatsRepeat } from '../../content/examples/fourOnTheFloor'
import { HI_HAT_ACCENTS } from '../../content/examples/hiHatAccents'
import { twinkle, twinkleDetached } from '../../content/examples/simpleMelody'
import { EXAMPLES_NAV } from '../navigation'
import { ROUTES } from '../router'
import { ExampleArticle } from '../templates'
import type { ExampleArticleConfig } from '../templates'

const shared = { nav: EXAMPLES_NAV } as const
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
  next: { label: 'Dance Monkey', path: ROUTES.danceMonkey },
}

export const SimpleMelodyPage = () => <ExampleArticle config={SIMPLE_MELODY} />
export const FourOnTheFloorPage = () => <ExampleArticle config={FOUR_ON_THE_FLOOR_PAGE} />
export const BackbeatPage = () => <ExampleArticle config={BACKBEAT_PAGE} />
export const HiHatAccentsPage = () => <ExampleArticle config={HI_HAT_ACCENTS_PAGE} />
