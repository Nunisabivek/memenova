// Very lightweight content moderation/sanitization utility.
// This is NOT a replacement for a full trust & safety system,
// but helps keep generated text PG-13 by soft-filtering strong profanity and slurs.

export type ModerationResult = {
  text: string
  flagged: boolean
  reasons: string[]
}

const forbiddenPatterns: Array<{ pattern: RegExp; reason: string }> = [
  // Strong profanity (example subset)
  { pattern: /\b(fuck|f\*+k|f—k)\b/gi, reason: 'strong_profanity' },
  { pattern: /\b(shit|s\*+t)\b/gi, reason: 'profanity' },
  { pattern: /\b(bitch|b\*+ch)\b/gi, reason: 'harassment' },
  // Slurs and hateful content (placeholder list; intentionally not exhaustively listed here)
  { pattern: /\b(retard|retarded)\b/gi, reason: 'hate_speech' },
  // Sexual content (very rough)
  { pattern: /\b(anal|oral|blowjob|handjob|porn)\b/gi, reason: 'sexual_content' },
]

function softCensor(match: string): string {
  return match
    .split('')
    .map((ch) => (/[aeiou]/i.test(ch) ? '*' : ch))
    .join('')
}

export function moderateText(input: string): ModerationResult {
  let text = input
  const reasons: string[] = []

  for (const { pattern, reason } of forbiddenPatterns) {
    if (pattern.test(text)) {
      reasons.push(reason)
      text = text.replace(pattern, (m) => softCensor(m))
    }
  }

  return { text, flagged: reasons.length > 0, reasons }
}

export function moderateArray(items: string[]): { items: string[]; anyFlagged: boolean; reasons: string[] } {
  const out: string[] = []
  let anyFlagged = false
  const reasonsSet = new Set<string>()
  for (const item of items) {
    const res = moderateText(item)
    out.push(res.text)
    if (res.flagged) {
      anyFlagged = true
      res.reasons.forEach((r) => reasonsSet.add(r))
    }
  }
  return { items: out, anyFlagged, reasons: Array.from(reasonsSet) }
}


