function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inlineCode(str: string): string {
  return str.replace(/`([^`]+)`/g, (_, code) =>
    `<code class="px-1 py-0.5 rounded bg-muted/30 font-mono text-xs">${escapeHtml(code)}</code>`
  )
}

export function renderDescription(raw: string): string {
  const lines = raw.split('\n')
  const html: string[] = []
  let inUl = false
  let inOl = false

  function closeList() {
    if (inUl) { html.push('</ul>'); inUl = false }
    if (inOl) { html.push('</ol>'); inOl = false }
  }

  for (const line of lines) {
    const trimmed = line.trim()

    // Heading
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/)
    if (headingMatch) {
      closeList()
      const level = headingMatch[1]!.length
      const tag = level === 1 ? 'h3' : level === 2 ? 'h4' : 'h5'
      const cls = level === 1 ? 'font-bold text-base mt-3 mb-1' : 'font-semibold text-sm mt-2 mb-0.5'
      html.push(`<${tag} class="${cls}">${inlineCode(escapeHtml(headingMatch[2]!))}</${tag}>`)
      continue
    }

    // Unordered list
    const ulMatch = trimmed.match(/^[*\-]\s+(.+)/)
    if (ulMatch) {
      if (!inUl) { closeList(); html.push('<ul class="list-disc pl-4 space-y-0.5 my-1">'); inUl = true }
      html.push(`<li>${inlineCode(escapeHtml(ulMatch[1]!))}</li>`)
      continue
    }

    // Ordered list
    const olMatch = trimmed.match(/^\d+\.\s+(.+)/)
    if (olMatch) {
      if (!inOl) { closeList(); html.push('<ol class="list-decimal pl-4 space-y-0.5 my-1">'); inOl = true }
      html.push(`<li>${inlineCode(escapeHtml(olMatch[1]!))}</li>`)
      continue
    }

    closeList()

    // Empty line → spacing
    if (!trimmed) {
      html.push('<div class="h-1.5" />')
      continue
    }

    // Regular paragraph
    html.push(`<p>${inlineCode(escapeHtml(trimmed))}</p>`)
  }

  closeList()
  return html.join('')
}
