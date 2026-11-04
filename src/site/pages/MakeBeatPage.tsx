import source from '../../content/examples/backbeat.ts?raw'
import practiceSource from '../../content/lessons/makeBeat.ts?raw'
import { BACKBEAT } from '../../content/examples/backbeat'
import { makeBeat } from '../../content/lessons/makeBeat'
import { LessonArticle } from '../LessonArticle'
import { ROUTES, href } from '../router'

export function MakeBeatPage() {
  return <LessonArticle path={ROUTES.makeBeat} title="Make a beat" lesson={2}
    intro={<>Build a drum groove from <a href={href(ROUTES.kick)}>kick</a>, <a href={href(ROUTES.snare)}>snare</a> and <a href={href(ROUTES.hiHat)}>hi-hat</a>. Give each part its own rhythm, then play them together.</>}
    learn={[<>Use rests to place drum hits</>, <>Layer rhythms with <code>fn('stack', …)</code></>, <>Accent eight hi-hats without changing their timing</>]}
    steps={[
      { id: 'backbeat', title: 'Count four beats', source, region: 'backbeat', pattern: BACKBEAT.backbeat, playerTitle: 'Kick and snare', body: <>
        <p>Count “1, 2, 3, 4”. The <a href={href(ROUTES.kick)}>kick</a> plays on 1 and 3; the <a href={href(ROUTES.snare)}>snare</a> answers on 2 and 4.
          Each sequence has four slots, so each slot is one beat. A rest keeps its slot silent.</p>
        <p>The sound functions come from the Cookbook. <code>KICK</code> is a low note for the synthesized kick;
          <code> NOISE</code> is white noise for the snare. Neither needs a sample download.</p>
      </> },
      { id: 'hi-hats', title: 'Fill the spaces with hi-hats', source, region: 'with-hats', pattern: BACKBEAT.withHats, playerTitle: 'Eight hi-hats over the beat', body: <>
        <p>For the <a href={href(ROUTES.hiHat)}>hi-hats</a>, <code>repeat(NOISE, 8)</code> fits eight strikes into one bar: two per beat.
          Count “1 and 2 and 3 and 4 and”. The kick and snare keep their four-slot grids.</p>
        <p><code>fn('stack', …)</code> plays the three patterns at once. This registry function layers complete patterns;
          it is different from the Mini-Notation <code>stack</code> helper used for notes in a chord.</p>
      </> },
      { id: 'variation', title: 'Move one kick', source, region: 'busier-kick', pattern: BACKBEAT.busier, playerTitle: 'A busier beat', body: <>
        <p>Give the kick eight slots too. Its hits now land on beat 1, beat 3 and the “and” after 3.
          The other parts stay in place; a denser grid gives you more positions, not a longer bar.</p>
      </> },
    ]}
    practice={{ title: 'Your beat', source: practiceSource, region: 'practice', build: makeBeat,
      label: 'Off-beat hi-hat level', unit: '×', initial: 0.5, min: 0, max: 1, step: 0.05 }}
    recap={<>
      <p>The practice player returns to the kick on 1 and 3. Its alternating velocity pattern keeps the beat-aligned
        hi-hats at 1 and scales the off-beats. At 0 the off-beats are silent; at 1 all eight have the same level.</p>
      <ul><li>Write rhythm with notes, sound tokens and rests.</li><li>Keep sound modifiers separate so one sound can play many rhythms.</li>
        <li>Layer complete patterns with <code>fn('stack', …)</code>; set the shared tempo on the result.</li></ul>
      <p>Explore the <a href={href(ROUTES.kick)}>Kick</a>, <a href={href(ROUTES.snare)}>Snare</a> and <a href={href(ROUTES.hiHat)}>Hi-hat</a> sounds,
        or compare <a href={href(ROUTES.hiHatAccents)}>Hi-hat accents</a>.</p>
    </>}
    previous={{ label: 'Your first song', path: ROUTES.firstSong }} next={{ label: 'Add a bass line', path: ROUTES.addBass }} />
}
