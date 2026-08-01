import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import ContactPage, { metadata } from './page'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('ContactPage', () => {
  it('define metadata de título e descrição', () => {
    expect(metadata.title).toMatch(/contato/i)
    expect(metadata.description).toBeTruthy()
  })

  it('renderiza os dados de contato e o formulário', () => {
    renderWithTheme(<ContactPage />)
    expect(screen.getByText('comunidade.cafebugado@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('+55 11 96188-9886')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /fale com a comunidade/i })).toBeInTheDocument()
  })
})
