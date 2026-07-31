import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Home from './page'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('Home', () => {
  it('renders the page title', () => {
    renderWithTheme(<Home />)
    expect(screen.getByRole('heading', { name: /eventos café bugado/i })).toBeInTheDocument()
  })
})
