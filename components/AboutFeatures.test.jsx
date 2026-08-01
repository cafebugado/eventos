import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import AboutFeatures from './AboutFeatures'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('AboutFeatures', () => {
  it('renderiza o título e as features fixas', () => {
    renderWithTheme(<AboutFeatures totalEventos={null} />)
    expect(screen.getByText('Curadoria Especializada')).toBeInTheDocument()
    expect(screen.getByText('Projeto Colaborativo')).toBeInTheDocument()
  })

  it('não exibe o contador de eventos quando totalEventos é null', () => {
    renderWithTheme(<AboutFeatures totalEventos={null} />)
    expect(screen.queryByText(/eventos cadastrados/i)).not.toBeInTheDocument()
  })

  it('exibe o contador de eventos quando totalEventos é fornecido', () => {
    renderWithTheme(<AboutFeatures totalEventos={42} />)
    expect(screen.getByText(/eventos cadastrados/i)).toBeInTheDocument()
  })
})
