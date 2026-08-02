import { useState } from 'react'
import ThemeToggleSwitch from './ThemeToggleSwitch'

export default {
  title: 'Design System/ThemeToggleSwitch',
  component: ThemeToggleSwitch,
}

function Template({ initialChecked }) {
  const [checked, setChecked] = useState(initialChecked)
  return (
    <ThemeToggleSwitch
      checked={checked}
      onChange={() => setChecked((prev) => !prev)}
      aria-label="Alternar tema"
    />
  )
}

export const Claro = {
  render: () => <Template initialChecked={false} />,
}

export const Escuro = {
  render: () => <Template initialChecked />,
}
