import { LayoutGrid, List, AlignJustify } from 'lucide-react'
import './ViewToggle.css'

const MODES = [
  { id: 'grid', icon: LayoutGrid, label: 'Grade', mobileOnly: false },
  { id: 'list', icon: List, label: 'Lista', mobileOnly: false },
  { id: 'compact', icon: AlignJustify, label: 'Compacto', mobileOnly: false },
]

export default function ViewToggle({ viewMode, onChange, isMobile }) {
  const modes = isMobile ? MODES.filter((m) => m.id !== 'grid') : MODES

  return (
    <div className="view-toggle" role="group" aria-label="Modo de visualização">
      {modes.map((mode) => {
        const ModeIcon = mode.icon
        return (
          <button
            key={mode.id}
            className={`view-toggle-btn${viewMode === mode.id ? ' active' : ''}`}
            onClick={() => onChange(mode.id)}
            title={mode.label}
            aria-label={mode.label}
            aria-pressed={viewMode === mode.id}
          >
            <ModeIcon size={16} />
          </button>
        )
      })}
    </div>
  )
}
