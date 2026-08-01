import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../theme/theme'
import NewEventToastContainer from './NewEventToastContainer'

const { useRealtimeEventsMock, pushMock } = vi.hoisted(() => ({
  useRealtimeEventsMock: vi.fn(),
  pushMock: vi.fn(),
}))

vi.mock('../hooks/useRealtimeEvents', () => ({ useRealtimeEvents: useRealtimeEventsMock }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

function emitEvent(event) {
  const onNewEvent = useRealtimeEventsMock.mock.calls.at(-1)[0]
  act(() => onNewEvent(event))
}

const SAMPLE_EVENT = {
  id: '1',
  slug: 'meetup-react',
  nome: 'Meetup React',
  data_evento: '10/08/2026',
  horario: '19:00',
  imagem: null,
}

describe('NewEventToastContainer', () => {
  beforeEach(() => {
    useRealtimeEventsMock.mockReset()
    pushMock.mockClear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('não renderiza nada sem eventos novos', () => {
    renderWithTheme(<NewEventToastContainer />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('mostra um toast quando um evento novo chega via realtime', () => {
    renderWithTheme(<NewEventToastContainer />)
    emitEvent(SAMPLE_EVENT)

    expect(screen.getByText('Meetup React')).toBeInTheDocument()
    expect(screen.getByText('10/08/2026 · 19:00')).toBeInTheDocument()
  })

  it('navega para o evento e fecha o toast ao clicar em Ver evento', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithTheme(<NewEventToastContainer />)
    emitEvent(SAMPLE_EVENT)

    await user.click(screen.getByRole('button', { name: /ver evento/i }))

    expect(pushMock).toHaveBeenCalledWith('/eventos/meetup-react')
    await waitForElementToBeRemoved(() => screen.queryByText('Meetup React'))
  })

  it('fecha ao clicar no botão de fechar', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderWithTheme(<NewEventToastContainer />)
    emitEvent(SAMPLE_EVENT)

    await user.click(screen.getByRole('button', { name: 'Fechar notificação' }))
    await waitForElementToBeRemoved(() => screen.queryByText('Meetup React'))
  })

  it('some sozinho depois do tempo de auto-dismiss', async () => {
    renderWithTheme(<NewEventToastContainer />)
    emitEvent(SAMPLE_EVENT)

    expect(screen.getByText('Meetup React')).toBeInTheDocument()

    // Dois avanços separados: o primeiro cruza os 8s do auto-dismiss (o que
    // dispara setVisible(false) dentro do interval); o segundo dá tempo pro
    // Slide processar a transição de saída e chamar onExited. Precisam ser
    // act() separados pra React processar o re-render entre um e outro.
    await act(async () => {
      vi.advanceTimersByTime(8000)
    })
    await act(async () => {
      vi.advanceTimersByTime(500)
    })

    expect(screen.queryByText('Meetup React')).not.toBeInTheDocument()
  })

  it('limita no máximo 3 toasts simultâneos', () => {
    renderWithTheme(<NewEventToastContainer />)
    emitEvent({ ...SAMPLE_EVENT, id: '1', nome: 'Evento 1' })
    emitEvent({ ...SAMPLE_EVENT, id: '2', nome: 'Evento 2' })
    emitEvent({ ...SAMPLE_EVENT, id: '3', nome: 'Evento 3' })
    emitEvent({ ...SAMPLE_EVENT, id: '4', nome: 'Evento 4' })

    expect(screen.queryByText('Evento 1')).not.toBeInTheDocument()
    expect(screen.getByText('Evento 2')).toBeInTheDocument()
    expect(screen.getByText('Evento 3')).toBeInTheDocument()
    expect(screen.getByText('Evento 4')).toBeInTheDocument()
  })
})
