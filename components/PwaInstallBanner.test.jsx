import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../theme/theme'
import PwaInstallBanner from './PwaInstallBanner'

const { usePwaMock } = vi.hoisted(() => ({ usePwaMock: vi.fn() }))

vi.mock('../hooks/usePwa', () => ({ usePwa: usePwaMock }))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('PwaInstallBanner', () => {
  beforeEach(() => {
    usePwaMock.mockReset()
    localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('não mostra nada se o app não é instalável', async () => {
    usePwaMock.mockReturnValue({ isInstallable: false, isInstalled: false, install: vi.fn() })
    renderWithTheme(<PwaInstallBanner />)

    await act(async () => {
      vi.advanceTimersByTime(3500)
    })

    expect(screen.queryByRole('dialog', { name: 'Instalar aplicativo' })).not.toBeInTheDocument()
  })

  it('mostra o card após 3s e instala ao clicar', async () => {
    const install = vi.fn().mockResolvedValue('accepted')
    usePwaMock.mockReturnValue({ isInstallable: true, isInstalled: false, install })
    renderWithTheme(<PwaInstallBanner />)

    await act(async () => {
      vi.advanceTimersByTime(3100)
    })

    expect(screen.getByRole('dialog', { name: 'Instalar aplicativo' })).toBeInTheDocument()

    await act(async () => {
      await userEvent
        .setup({ advanceTimers: vi.advanceTimersByTime })
        .click(screen.getByRole('button', { name: 'Instalar agora' }))
    })

    expect(install).toHaveBeenCalled()
  })

  it('grava no localStorage e não mostra de novo ao clicar em "não mostrar novamente"', async () => {
    usePwaMock.mockReturnValue({ isInstallable: true, isInstalled: false, install: vi.fn() })
    const { unmount } = renderWithTheme(<PwaInstallBanner />)

    await act(async () => {
      vi.advanceTimersByTime(3100)
    })

    await act(async () => {
      await userEvent
        .setup({ advanceTimers: vi.advanceTimersByTime })
        .click(screen.getByRole('button', { name: 'Não mostrar novamente' }))
    })

    expect(localStorage.getItem('pwa-install-banner-dismissed')).toBe('true')
    unmount()

    renderWithTheme(<PwaInstallBanner />)
    await act(async () => {
      vi.advanceTimersByTime(3500)
    })
    expect(screen.queryByRole('dialog', { name: 'Instalar aplicativo' })).not.toBeInTheDocument()
  })
})
