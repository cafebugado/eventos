import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Home from './page'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('Home', () => {
  it('renderiza o título sem depender de dados externos (sem fonte de dados até a nova API ser plugada)', () => {
    renderWithTheme(Home())

    expect(
      screen.getByRole('heading', { name: /eventos de tecnologia em um só lugar/i })
    ).toBeInTheDocument()
  })
})
