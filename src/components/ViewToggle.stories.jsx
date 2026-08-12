import { useState } from 'react'
import ViewToggle from './ViewToggle'

export default {
  title: 'Design System/ViewToggle',
  component: ViewToggle,
}

function Template() {
  const [viewMode, setViewMode] = useState('grid')
  return <ViewToggle viewMode={viewMode} onChange={setViewMode} />
}

export const Default = {
  render: () => <Template />,
}
