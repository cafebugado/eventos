'use client'

import Box from '@mui/material/Box'
import { formatRichText } from '../utils/richText'

export default function RichText({ content, sx, stopPropagationOnLinks = false }) {
  if (!content) {
    return null
  }

  const html = formatRichText(content)
  const handleClick = stopPropagationOnLinks
    ? (event) => {
        if (event.target.closest('a')) {
          event.stopPropagation()
        }
      }
    : undefined

  return (
    <Box
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
      sx={[
        {
          color: 'inherit',
          font: 'inherit',
          lineHeight: 'inherit',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          '& p': { m: 0, mb: 1.5 },
          '& p:last-child': { mb: 0 },
          '& ul, & ol': { m: 0, mb: 1.5, pl: 2.5 },
          '& li': { mb: 0.5 },
          '& li:last-child': { mb: 0 },
          '& a': { color: 'primary.main', textDecoration: 'underline' },
          '& a:hover': { color: 'primary.dark' },
          '& strong': { color: 'text.primary' },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  )
}
