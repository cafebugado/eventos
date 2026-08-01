import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import AddToCalendarButton from './AddToCalendarButton'
import { downloadICS } from '../utils/calendarExport'

vi.mock('../utils/calendarExport', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, downloadICS: vi.fn() }
})

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const event = {
  id: '1',
  nome: 'Evento Teste',
  data_evento: '20/02/2026',
  horario: '19:00',
}

describe('AddToCalendarButton', () => {
  it('abre o menu ao clicar no botão', async () => {
    renderWithTheme(<AddToCalendarButton event={event} />)
    await userEvent.click(screen.getByRole('button', { name: /adicionar ao calendário/i }))
    expect(screen.getByText('Google Calendar')).toBeInTheDocument()
    expect(screen.getByText('Apple / iCal')).toBeInTheDocument()
    expect(screen.getByText('Outlook')).toBeInTheDocument()
  })

  it('abre o Google Calendar em uma nova aba ao clicar na opção', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {})
    renderWithTheme(<AddToCalendarButton event={event} />)
    await userEvent.click(screen.getByRole('button', { name: /adicionar ao calendário/i }))
    await userEvent.click(screen.getByText('Google Calendar'))
    expect(openSpy).toHaveBeenCalled()
    openSpy.mockRestore()
  })

  it('baixa o arquivo .ics ao clicar em Apple / iCal', async () => {
    renderWithTheme(<AddToCalendarButton event={event} />)
    await userEvent.click(screen.getByRole('button', { name: /adicionar ao calendário/i }))
    await userEvent.click(screen.getByText('Apple / iCal'))
    expect(downloadICS).toHaveBeenCalledWith(event)
  })
})
