import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../theme/theme'
import PwaUpdateBanner from './PwaUpdateBanner'

const { usePwaMock } = vi.hoisted(() => ({ usePwaMock: vi.fn() }))

vi.mock('../hooks/usePwa', () => ({ usePwa: usePwaMock }))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('PwaUpdateBanner', () => {
  beforeEach(() => {
    usePwaMock.mockReset()
  })

  it('não renderiza nada quando não há atualização disponível', () => {
    usePwaMock.mockReturnValue({ updateAvailable: false, applyUpdate: vi.fn() })
    renderWithTheme(<PwaUpdateBanner />)
    expect(screen.queryByText('Nova versão disponível')).not.toBeInTheDocument()
  })

  it('mostra a barra e aplica a atualização ao clicar em Atualizar', async () => {
    const applyUpdate = vi.fn()
    usePwaMock.mockReturnValue({ updateAvailable: true, applyUpdate })
    renderWithTheme(<PwaUpdateBanner />)

    expect(screen.getByText('Nova versão disponível')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Atualizar' }))
    expect(applyUpdate).toHaveBeenCalled()
  })

  it('fecha a barra ao clicar no botão de fechar', async () => {
    usePwaMock.mockReturnValue({ updateAvailable: true, applyUpdate: vi.fn() })
    renderWithTheme(<PwaUpdateBanner />)

    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    await waitForElementToBeRemoved(() => screen.queryByText('Nova versão disponível'))
  })
})
