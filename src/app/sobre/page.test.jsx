import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import AboutPage, { metadata } from './page'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('AboutPage', () => {
  it('define metadata de título e descrição', () => {
    expect(metadata.title).toMatch(/sobre/i)
    expect(metadata.description).toBeTruthy()
  })

  it('renderiza sem estatísticas nem contribuintes (sem fonte de dados até a nova API ser plugada)', () => {
    renderWithTheme(AboutPage())

    expect(screen.getByText('Nenhum contribuinte cadastrado ainda.')).toBeInTheDocument()
  })
})
