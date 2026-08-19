import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventActions from './EventActions'
import { useFavouritesStore } from '../../../store/useFavouritesStore'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const event = {
  id: '1',
  nome: 'Evento Teste',
  data_evento: '20/02/2999',
  horario: '19:00',
  link: 'https://evento.com',
}

describe('EventActions', () => {
  beforeEach(() => {
    useFavouritesStore.setState({ favourites: [], favouriteIds: new Set() })
  })

  it('renderiza o link "Participar do Evento" quando não é passado', () => {
    renderWithTheme(<EventActions event={event} isPast={false} shareUrl="https://x.com/e/1" />)
    expect(screen.getByRole('link', { name: /participar do evento/i })).toHaveAttribute(
      'href',
      'https://evento.com'
    )
  })

  it('desabilita o botão quando o evento é passado', () => {
    renderWithTheme(<EventActions event={event} isPast shareUrl="https://x.com/e/1" />)
    expect(screen.getByText('Evento Encerrado')).toBeInTheDocument()
  })

  it('não renderiza calendário/compartilhamento quando o evento é passado', () => {
    renderWithTheme(<EventActions event={event} isPast shareUrl="https://x.com/e/1" />)
    expect(
      screen.queryByRole('button', { name: /adicionar ao calendário/i })
    ).not.toBeInTheDocument()
  })

  it('favorita o evento ao clicar no botão de favorito', async () => {
    renderWithTheme(<EventActions event={event} isPast={false} shareUrl="https://x.com/e/1" />)
    await userEvent.click(screen.getByRole('button', { name: /favoritar/i }))
    expect(useFavouritesStore.getState().favouriteIds.has('1')).toBe(true)
  })
})
