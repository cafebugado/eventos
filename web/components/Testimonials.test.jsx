import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Testimonials from './Testimonials'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('Testimonials', () => {
  it('renderiza o título da seção', () => {
    renderWithTheme(<Testimonials />)
    expect(screen.getByRole('heading', { name: /o que diz a comunidade/i })).toBeInTheDocument()
  })

  it('renderiza os 3 depoimentos', () => {
    renderWithTheme(<Testimonials />)
    expect(screen.getByText('Lucas Mendes')).toBeInTheDocument()
    expect(screen.getByText('Ana Souza')).toBeInTheDocument()
    expect(screen.getByText('Pedro Oliveira')).toBeInTheDocument()
  })
})
