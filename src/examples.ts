export const PLAYGROUND_EXAMPLES = [
  {
    id: 'melody',
    name: 'Melody',
    description: 'Four notes in one cycle, played on a triangle synth.',
    preview: 'note("c4 e4 g4 b4")',
    code: `setcpm(30)
note("c4 e4 g4 b4")
  .s("triangle")
  .gain(0.3)`,
  },
  {
    id: 'bass',
    name: 'Bass',
    description: 'A slower bass line. Angle brackets change the note each cycle.',
    preview: 'note("<c2 a1 f2 g2>")',
    code: `setcpm(30)
note("<c2 a1 f2 g2>")
  .s("sine")
  .gain(0.4)`,
  },
  {
    id: 'layers',
    name: 'Layers',
    description: 'Play a melody and bass together with stack().',
    preview: 'stack(melody, bass)',
    code: `setcpm(30)
stack(
  note("c4 ~ e4 g4").s("triangle").gain(0.25),
  note("<c2 a1 f2 g2>").s("sine").gain(0.4)
)`,
  },
] as const

export const DEFAULT_CODE = PLAYGROUND_EXAMPLES[0].code
