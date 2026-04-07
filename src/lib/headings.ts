// 마크다운 본문에서 H1–H3 헤딩 추출 + 안정적인 slug 생성
// 코드펜스 내부의 #는 헤딩이 아니므로 제외

export type Heading = { level: 1 | 2 | 3; text: string; id: string }

export function slugify(text: string, used: Map<string, number>): string {
  const base =
    text
      .toLowerCase()
      .trim()
      .replace(/[`*_~]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\p{L}\p{N}\-]/gu, '') || 'section'
  const n = used.get(base) ?? 0
  used.set(base, n + 1)
  return n === 0 ? base : `${base}-${n}`
}

export function extractHeadings(md: string): Heading[] {
  const out: Heading[] = []
  const used = new Map<string, number>()
  let inFence = false
  for (const raw of md.split('\n')) {
    const line = raw.trimEnd()
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const m = /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!m) continue
    const level = m[1].length as 1 | 2 | 3
    const text = m[2]
    out.push({ level, text, id: slugify(text, used) })
  }
  return out
}
