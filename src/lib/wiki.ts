/** Extract [[wiki link]] targets from a markdown body. */
export function extractWikiLinks(body: string): string[] {
  const out: string[] = []
  const re = /\[\[([^\]\n]+?)\]\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(body))) {
    const t = m[1].trim()
    if (t && !out.includes(t)) out.push(t)
  }
  return out
}

export function normalizeTitle(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}
