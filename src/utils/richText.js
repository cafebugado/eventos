const NEWLINE_REGEX = /\r\n?/g
const UNORDERED_LIST_REGEX = /^\s*[-*]\s+(.+)$/
const ORDERED_LIST_REGEX = /^\s*\d+[.)]\s+(.+)$/
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g
const BARE_URL_REGEX = /\b((https?:\/\/|www\.)[^\s<]+)\b/g

const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const escapeAttribute = (value) => value.replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const normalizeUrl = (value) => {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`
  }
  return trimmed
}

const isSafeUrl = (value) => /^(https?:\/\/|mailto:)/i.test(value)

const buildLink = (href, label) => {
  const normalized = normalizeUrl(href)
  if (!normalized || !isSafeUrl(normalized)) {
    return label
  }
  const safeHref = escapeAttribute(normalized)
  return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${label}</a>`
}

const formatEmphasis = (value) =>
  value
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(?!\s)([^*]+?)\*(?!\*)/g, '<em>$1</em>')

const formatInline = (value) => {
  const placeholders = []
  let output = value.replace(MARKDOWN_LINK_REGEX, (match, label, url) => {
    const placeholder = `%%LINK${placeholders.length}%%`
    placeholders.push(buildLink(url, label))
    return placeholder
  })

  output = output.replace(BARE_URL_REGEX, (match) => buildLink(match, match))
  output = formatEmphasis(output)
  output = output.replace(/%%LINK(\d+)%%/g, (match, index) => {
    return placeholders[Number(index)] || match
  })
  return output
}

export const formatRichText = (value) => {
  if (!value) {
    return ''
  }

  const escaped = escapeHtml(value.replace(NEWLINE_REGEX, '\n'))
  const lines = escaped.split('\n')
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) {
      index += 1
      continue
    }

    const unorderedMatch = line.match(UNORDERED_LIST_REGEX)
    if (unorderedMatch) {
      const items = []
      while (index < lines.length) {
        const current = lines[index]
        const match = current.match(UNORDERED_LIST_REGEX)
        if (!match) {
          break
        }
        items.push(match[1])
        index += 1
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    const orderedMatch = line.match(ORDERED_LIST_REGEX)
    if (orderedMatch) {
      const items = []
      while (index < lines.length) {
        const current = lines[index]
        const match = current.match(ORDERED_LIST_REGEX)
        if (!match) {
          break
        }
        items.push(match[1])
        index += 1
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    const paragraphLines = []
    while (index < lines.length) {
      const current = lines[index]
      if (!current.trim()) {
        break
      }
      if (UNORDERED_LIST_REGEX.test(current) || ORDERED_LIST_REGEX.test(current)) {
        break
      }
      paragraphLines.push(current)
      index += 1
    }
    blocks.push({ type: 'p', lines: paragraphLines })
  }

  return blocks
    .map((block) => {
      if (block.type === 'ul') {
        const items = block.items.map((item) => `<li>${formatInline(item)}</li>`).join('')
        return `<ul>${items}</ul>`
      }
      if (block.type === 'ol') {
        const items = block.items.map((item) => `<li>${formatInline(item)}</li>`).join('')
        return `<ol>${items}</ol>`
      }
      const content = block.lines.map((line) => formatInline(line)).join('<br />')
      return `<p>${content}</p>`
    })
    .join('')
}

export const stripRichText = (value) => {
  if (!value) {
    return ''
  }

  let output = value.replace(NEWLINE_REGEX, '\n')
  output = output.replace(MARKDOWN_LINK_REGEX, '$1')
  output = output.replace(/\*\*(.+?)\*\*/g, '$1')
  output = output.replace(/\*(.+?)\*/g, '$1')
  output = output.replace(/^\s*[-*]\s+/gm, '- ')
  output = output.replace(/^\s*\d+[.)]\s+/gm, '')
  return output.trim()
}
