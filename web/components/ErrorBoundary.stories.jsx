import Typography from '@mui/material/Typography'
import ErrorBoundary from './ErrorBoundary'

function Boom() {
  throw new Error('Erro de exemplo para o Storybook')
}

export default {
  title: 'Design System/ErrorBoundary',
  component: ErrorBoundary,
}

export const SemErro = {
  render: () => (
    <ErrorBoundary>
      <Typography>Conteúdo renderizado normalmente.</Typography>
    </ErrorBoundary>
  ),
}

export const ComErro = {
  render: () => (
    <ErrorBoundary>
      <Boom />
    </ErrorBoundary>
  ),
}
