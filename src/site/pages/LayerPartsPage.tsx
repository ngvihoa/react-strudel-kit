import songSource from '../../content/examples/layerASong.ts?raw'
import chordSource from '../../content/examples/chords.ts?raw'
import practiceSource from '../../content/lessons/layerParts.ts?raw'
import { LAYER_A_SONG } from '../../content/examples/layerASong'
import { CHORD_EXAMPLES } from '../../content/examples/chords'
import { makeArrangement } from '../../content/lessons/layerParts'
import { LessonArticle } from '../LessonArticle'
import { ROUTES, href } from '../router'

export function LayerPartsPage() {
  return <LessonArticle path={ROUTES.layerParts} title="Layer the parts" lesson={4}
    intro="Your drums and bass are a foundation. Add harmony and a melody, then give each layer room in the mix."
    learn={[<>Turn chord tones into an arpeggio</>, <>Combine one-bar drums with four-bar musical parts</>, <>Balance foreground and background without rewriting sounds</>]}
    steps={[
      { id: 'harmony', title: 'Give the bass some harmony', source: chordSource, region: 'arpeggio', pattern: CHORD_EXAMPLES.arpeggio,
        playerTitle: 'The harmony layer', body: <>
          <p>The bass followed C–Am–F–G. These keys use the same progression above it. An arpeggio plays chord tones one at a time:
            low, middle, high, middle, repeated twice. That makes eight notes per bar.</p>
          <p><code>sequence</code> writes the order inside a bar; <code>cat</code> advances through the four chords.
            Compare the <a href={href(ROUTES.chords)}>chords and arpeggios example</a> for the block-chord version.</p>
        </> },
      { id: 'melody', title: 'Add a foreground melody', source: songSource, region: 'melody', pattern: LAYER_A_SONG.melody,
        playerTitle: 'The melody layer', body: <>
          <p>The melody also has four bars. Read each sequence as a phrase: held notes contrast with shorter notes,
            and a written rest leaves room for the lead sound’s echo tail.</p>
          <p>The first bar holds its final C for two beats. In the last bar, D takes three beats and the written
            fourth beat is a rest. The <a href={href(ROUTES.lead)}>Lead sound</a> adds a quieter, delayed copy.</p>
        </> },
      { id: 'mix', title: 'Stack and balance the layers', source: songSource, region: 'together', pattern: LAYER_A_SONG.song,
        playerTitle: 'The complete arrangement', body: <>
          <p>The drums repeat every bar while bass, arpeggio and melody follow their four-bar phrases.
            Stacking does not force the parts to have the same phrase length.</p>
          <p>The arpeggio is background, so its velocity is 0.6. The melody stays in front at 1.
            <code> postGain</code> then scales the entire result; it is separate from the balance of individual parts.</p>
        </> },
    ]}
    practice={{ title: 'Your arrangement', source: practiceSource, region: 'practice', build: makeArrangement,
      label: 'Melody level', unit: '×', initial: 1, min: 0, max: 1, step: 0.05 }}
    recap={<>
      <p>Lower the melody level to focus on the accompaniment, then bring it forward again.
        The practice builder uses the same four layers as the complete arrangement.</p>
      <ul><li>Use different registers and musical roles to separate the parts.</li>
        <li>Keep each part reusable; combine patterns with <code>fn('stack', …)</code>.</li>
        <li>Scale levels with <code>velocity</code>, then set one shared tempo.</li></ul>
      <p>Next, put those layers behind React controls. You can also inspect the <a href={href(ROUTES.layerASong)}>Layer a song example</a>.</p>
    </>}
    previous={{ label: 'Add a bass line', path: ROUTES.addBass }} next={{ label: 'Control it with React', path: ROUTES.controlReact }} />
}
