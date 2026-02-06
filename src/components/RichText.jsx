import { formatRichText } from '../utils/richText'
import './RichText.css'

function RichText({ content, className = '', stopPropagationOnLinks = false }) {
  if (!content) {
    return null
  }

  const html = formatRichText(content)
  const classes = ['rich-text', className].filter(Boolean).join(' ')
  const handleClick = stopPropagationOnLinks
    ? (event) => {
        if (event.target.closest('a')) {
          event.stopPropagation()
        }
      }
    : undefined

  return (
    <div className={classes} onClick={handleClick} dangerouslySetInnerHTML={{ __html: html }} />
  )
}

export default RichText
