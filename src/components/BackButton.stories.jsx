import { fn } from 'storybook/test'
import BackButton from './BackButton'

export default {
  title: 'Design System/BackButton',
  component: BackButton,
  args: {
    onClick: fn(),
  },
}

export const Default = {}

export const LabelCustomizado = {
  args: {
    label: 'Voltar para eventos',
  },
}
