import source from '../../content/examples/bassLine.ts?raw'
import practiceSource from '../../content/lessons/addBass.ts?raw'
import { BASS_LINE } from '../../content/examples/bassLine'
import { makeBassMix } from '../../content/lessons/addBass'
import { LessonArticle } from '../LessonArticle'
import { ROUTES, href } from '../router'

export function AddBassPage() {
  return <LessonArticle path={ROUTES.addBass} title="Add a bass line" lesson={3}
    intro={<>Give your beat a low end. Start with one <a href={href(ROUTES.bass)}>bass</a> note per bar, add a rhythm, then balance it against the drums.</>}
    learn={[<>Follow C–Am–F–G with bass roots</>, <>Reuse a rhythm with a root and its fifth</>, <>Balance parts with <code>velocity</code></>]}
    steps={[
      { id: 'roots', title: 'Follow the chord roots', source, region: 'roots', pattern: BASS_LINE.roots, playerTitle: 'One bass root per bar', body: <>
        <p>The <a href={href(ROUTES.layerASong)}>next song</a> uses C, Am, F and G. Its bass roots are C, A, F and G: one note for each bar.{' '}
          <code>fn('cat', …)</code> plays one child pattern per cycle, so these four notes span four bars.</p>
        <p>Lower octaves put the bass below the melody. The <a href={href(ROUTES.bass)}>Bass Cookbook</a> supplies its filtered sound.</p>
      </> },
      { id: 'rhythm', title: 'Write one reusable bar', source, region: 'bar', body: <>
        <p>Give the bass eight slots per bar. Rests leave space between notes; the root establishes the chord and its fifth
          adds another chord tone. A fifth here is seven semitones above the root.</p>
        <p>The helper takes two pitches, so the rhythm stays the same when the harmony changes.</p>
      </> },
      { id: 'progression', title: 'Carry the rhythm through four bars', source, region: 'rhythm', pattern: BASS_LINE.rhythm, playerTitle: 'Roots and fifths', body: <>
        <p>Call that helper with C/G, A/E, F/C and G/D. Each pair gets one bar through <code>cat</code>.
          The first bass strike lands with the <a href={href(ROUTES.kick)}>kick</a> on beat 1; later notes fill the spaces.</p>
      </> },
      { id: 'drums', title: 'Bring the drums back', source, region: 'with-drums', pattern: BASS_LINE.withDrums, playerTitle: 'Bass with kick and snare', body: <>
        <p>Stack the bass with the <a href={href(ROUTES.kick)}>kick</a> and <a href={href(ROUTES.snare)}>snare</a> from <a href={href(ROUTES.makeBeat)}>Make a beat</a>. The drum pattern repeats each bar while the bass
          travels through its four-bar progression. Put <code>cpm</code> on the combined pattern so the parts share one tempo.</p>
      </> },
    ]}
    practice={{ title: 'Your bass mix', source: practiceSource, region: 'practice', build: makeBassMix,
      label: 'Bass level', unit: '×', initial: 1, min: 0, max: 1, step: 0.05 }}
    recap={<>
      <p>The practice mix adds <a href={href(ROUTES.hiHat)}>hi-hats</a>. Start with the bass at 0, then raise it until its rhythm is clear against the drums.{' '}
        <code>velocity</code> scales the sound’s gain; it does not replace the sound design.</p>
      <ul><li><code>cat</code> advances through bars; <code>sequence</code> divides the notes inside a bar.</li>
        <li>A rhythm helper lets each chord use its own root and fifth.</li><li>Use rests and level changes to leave space for the other parts.</li></ul>
      <p>Compare the <a href={href(ROUTES.bassLine)}>Bass line example</a> before adding harmony in the next lesson.</p>
    </>}
    previous={{ label: 'Make a beat', path: ROUTES.makeBeat }} next={{ label: 'Layer the parts', path: ROUTES.layerParts }} />
}
