import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CalendarDay from './CalendarDay'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('CalendarDay', () => {
  it('renderiza o número do dia', () => {
    renderWithTheme(<CalendarDay day={15} currentMonth events={[]} onClick={vi.fn()} />)
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('não é clicável quando não há eventos', () => {
    renderWithTheme(<CalendarDay day={15} currentMonth events={[]} onClick={vi.fn()} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('é clicável e chama onClick quando há eventos', async () => {
    const onClick = vi.fn()
    renderWithTheme(
      <CalendarDay
        day={15}
        currentMonth
        events={[{ id: '1', data_evento: '15/01/2999' }]}
        onClick={onClick}
      />
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })
})
