import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Footer from './Footer'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('Footer', () => {
  it('renderiza os links de redes sociais', () => {
    renderWithTheme(<Footer />)
    ;['GitHub', 'LinkedIn', 'WhatsApp', 'Telegram', 'Discord'].forEach((name) => {
      expect(screen.getByRole('link', { name })).toHaveAttribute(
        'href',
        expect.stringContaining('http')
      )
    })
  })

  it('renderiza o ano atual no copyright', () => {
    renderWithTheme(<Footer />)
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument()
  })

  it('abre os links de rede social em uma nova aba com segurança', () => {
    renderWithTheme(<Footer />)
    const githubLink = screen.getByRole('link', { name: 'GitHub' })
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })
})
