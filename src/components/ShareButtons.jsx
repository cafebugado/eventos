import { Share2 } from 'lucide-react'
import './ShareButtons.css'
import SocialIcons from './SocialIcons.jsx'
function ShareButtons({ className, eventName, eventDate, eventTime, eventUrl, eventLocation }) {
  return (
    <div className={`share-buttons ${className || ''}`}>
      <span className="share-label">
        <Share2 size={16} />
        Compartilhar
      </span>
      <SocialIcons
        eventName={eventName}
        eventDate={eventDate}
        eventTime={eventTime}
        eventUrl={eventUrl}
        eventLocation={eventLocation}
      />
    </div>
  )
}
export default ShareButtons
