import Link from 'next/link'
import type { ReactNode } from 'react'

const LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g

/** Renders text with [label](/path) links to pages on this site as real links. */
export function RichText({ text }: { text: string }) {
  const out: ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  LINK.lastIndex = 0
  while ((m = LINK.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push(<Link key={m.index} href={m[2]}>{m[1]}</Link>)
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return <>{out}</>
}
