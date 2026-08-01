import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import SocialIcons from './SocialIcons'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const eventProps = {
  eventName: 'Meetup Café Bugado',
  eventDate: '10/03/2026',
  eventTime: '19:00',
  eventUrl: 'https://cafebugado.com.br/eventos/meetup',
  eventLocation: 'São Paulo - SP',
}

describe('SocialIcons', () => {
  beforeEach(() => {
    vi.spyOn(window, 'open').mockImplementation(() => {})
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renderiza um botão para cada plataforma mais o botão de copiar link', () => {
    renderWithTheme(<SocialIcons {...eventProps} />)
    expect(screen.getByRole('button', { name: 'Compartilhar no WhatsApp' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Compartilhar no Telegram' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Compartilhar no Twitter' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Compartilhar no LinkedIn' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copiar link' })).toBeInTheDocument()
  })

  it('abre uma janela com a URL de compartilhamento do WhatsApp', async () => {
    renderWithTheme(<SocialIcons {...eventProps} />)

    await userEvent.click(screen.getByRole('button', { name: 'Compartilhar no WhatsApp' }))

    expect(window.open).toHaveBeenCalledTimes(1)
    const [url] = window.open.mock.calls[0]
    expect(url).toContain('https://wa.me/?text=')
    expect(decodeURIComponent(url)).toContain(eventProps.eventUrl)
  })

  it('copia o link e alterna o ícone/label para "Link copiado!"', async () => {
    renderWithTheme(<SocialIcons {...eventProps} />)

    await userEvent.click(screen.getByRole('button', { name: 'Copiar link' }))

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole('button', { name: 'Link copiado!' })).toBeInTheDocument()
  })
})
