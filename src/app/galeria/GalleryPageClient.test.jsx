import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import GalleryPageClient from './GalleryPageClient'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const events = [
  {
    id: '1',
    eventName: 'Meetup React',
    eventDate: '20/02/2026',
    community: 'Café Bugado',
    createdBy: 'Alice',
    photos: [
      {
        id: 'p1',
        url: 'https://example.com/1.png',
        thumb: 'https://example.com/1.png',
        caption: '',
      },
    ],
  },
]

describe('GalleryPageClient', () => {
  it('renderiza os cards de eventos', () => {
    renderWithTheme(<GalleryPageClient events={events} />)
    expect(screen.getByText('Meetup React')).toBeInTheDocument()
  })

  it('abre o lightbox ao clicar em um card e fecha ao clicar em Fechar', async () => {
    renderWithTheme(<GalleryPageClient events={events} />)
    await userEvent.click(screen.getByRole('button', { name: /meetup react/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
