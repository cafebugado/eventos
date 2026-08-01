import { useState } from 'react'
import ViewToggle from './ViewToggle'

export default {
  title: 'Design System/ViewToggle',
  component: ViewToggle,
}

function Template({ isMobile }) {
  const [viewMode, setViewMode] = useState('grid')
  return <ViewToggle viewMode={viewMode} onChange={setViewMode} isMobile={isMobile} />
}

export const Desktop = {
  render: () => <Template isMobile={false} />,
}

export const Mobile = {
  render: () => <Template isMobile />,
}
