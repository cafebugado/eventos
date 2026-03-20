import { Share2 } from 'lucide-react'
import './ShareButtons.css'
import SocialIcons from './SocialIcons.jsx'
function ShareButtons({ className }) {
  return (
    <div className={`share-buttons ${className || ''}`}>
      <span className="share-label">
        <Share2 size={16} />
        Compartilhar
      </span>
      <SocialIcons />
    </div>
  )
}
export default ShareButtons
