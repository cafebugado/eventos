import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import ComingSoonButton from './ComingSoonButton'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('ComingSoonButton', () => {
  it('renderiza o texto do botão e fica desabilitado de verdade', () => {
    renderWithTheme(<ComingSoonButton>Entrar</ComingSoonButton>)
    const button = screen.getByRole('button', { name: 'Entrar' })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('mostra o cadeado e o aviso "Em breve" junto', () => {
    renderWithTheme(<ComingSoonButton>Criar conta</ComingSoonButton>)
    expect(screen.getByTestId('LockOutlinedIcon')).toBeInTheDocument()
    expect(screen.getByText('Em breve')).toBeInTheDocument()
  })

  it('aceita variant contained', () => {
    renderWithTheme(<ComingSoonButton variant="contained">Criar conta</ComingSoonButton>)
    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeInTheDocument()
  })
})
