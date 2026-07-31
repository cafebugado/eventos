import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CalendarView from './CalendarView'
import { getToday } from '../../utils/eventDate'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

describe('CalendarView', () => {
  it('renderiza o mês e ano atuais', () => {
    const today = getToday()
    renderWithTheme(
      <CalendarView
        events={[]}
        eventTagsMap={{}}
        favouriteIds={new Set()}
        toggleFavourite={vi.fn()}
      />
    )
    expect(
      screen.getByText(`${MONTH_NAMES[today.getMonth()]} ${today.getFullYear()}`)
    ).toBeInTheDocument()
  })

  it('navega para o próximo mês ao clicar no botão', async () => {
    const today = getToday()
    renderWithTheme(
      <CalendarView
        events={[]}
        eventTagsMap={{}}
        favouriteIds={new Set()}
        toggleFavourite={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /próximo mês/i }))

    const nextMonthIndex = (today.getMonth() + 1) % 12
    const nextYear = today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear()
    expect(screen.getByText(`${MONTH_NAMES[nextMonthIndex]} ${nextYear}`)).toBeInTheDocument()
  })

  it('abre o modal do dia ao clicar em um dia com eventos', async () => {
    const today = getToday()
    const dd = String(today.getDate()).padStart(2, '0')
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const event = {
      id: '1',
      nome: 'Evento Hoje',
      data_evento: `${dd}/${mm}/${today.getFullYear()}`,
      horario: '19:00',
    }

    renderWithTheme(
      <CalendarView
        events={[event]}
        eventTagsMap={{}}
        favouriteIds={new Set()}
        toggleFavourite={vi.fn()}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: new RegExp(`^${today.getDate()},`) }))
    expect(await screen.findByText('Evento Hoje')).toBeInTheDocument()
  })
})
