import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import ShareButtons from './ShareButtons'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('ShareButtons', () => {
  it('renderiza o label e os ícones de compartilhamento', () => {
    renderWithTheme(<ShareButtons eventName="Meetup" eventUrl="https://example.com" />)

    expect(screen.getByText('Compartilhar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Compartilhar no WhatsApp' })).toBeInTheDocument()
  })
})
