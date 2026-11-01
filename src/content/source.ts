/**
 * Returns the lines between `// #region name` and `// #endregion` in a module's raw source.
 * Pages import a module twice — once to play it, once with `?raw` to show it — so the
 * code on screen is always the code that plays.
 */
export const sourceRegion = (source: string, name: string) => {
  const lines = source.split('\n')
  const start = lines.findIndex((line) => line.trim() === `// #region ${name}`)
  const end = lines.findIndex((line, index) => index > start && line.trim() === '// #endregion')
  if (start < 0 || end < 0) throw new Error(`Missing source region "${name}"`)
  const body = lines.slice(start + 1, end)
  const indent = Math.min(...body.filter((line) => line.trim()).map((line) => line.match(/^ */)![0].length))
  return body.map((line) => line.slice(indent)).join('\n').trim()
}
