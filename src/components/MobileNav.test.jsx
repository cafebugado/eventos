import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../theme/theme'
import { useFavouritesStore } from '../store/useFavouritesStore'
import MobileNav from './MobileNav'

const { usePathnameMock, pushMock } = vi.hoisted(() => ({
  usePathnameMock: vi.fn(() => '/'),
  pushMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: usePathnameMock,
  useRouter: () => ({ push: pushMock }),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('MobileNav', () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue('/')
    pushMock.mockClear()
    useFavouritesStore.setState({ favourites: [], favouriteIds: new Set() })
    window.localStorage.clear()
  })

  it('abre o menu sem Favoritos quando não há favoritos', async () => {
    renderWithTheme(<MobileNav />)

    await userEvent.click(screen.getByRole('button', { name: 'Menu de navegação' }))

    expect(screen.getByRole('menuitem', { name: 'Inicio' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Sobre' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Eventos' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Galeria' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Contato' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Favoritos' })).not.toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Modo escuro' })).toBeInTheDocument()
  })

  it('mostra Favoritos quando existe evento favoritado', async () => {
    useFavouritesStore.setState({
      favourites: [{ id: '1', nome: 'Evento favorito' }],
      favouriteIds: new Set(['1']),
    })
    renderWithTheme(<MobileNav />)

    await userEvent.click(screen.getByRole('button', { name: 'Menu de navegação' }))

    expect(screen.getByRole('menuitem', { name: 'Favoritos' })).toBeInTheDocument()
  })

  it('navega e fecha o menu ao clicar em um item', async () => {
    renderWithTheme(<MobileNav />)

    await userEvent.click(screen.getByRole('button', { name: 'Menu de navegação' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Eventos' }), {
      pointerEventsCheck: 0,
    })

    expect(pushMock).toHaveBeenCalledWith('/eventos')
    expect(screen.getByRole('button', { name: 'Menu de navegação' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('alterna o tema ao clicar na ação de tema', async () => {
    renderWithTheme(<MobileNav />)

    await userEvent.click(screen.getByRole('button', { name: 'Menu de navegação' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Modo escuro' }), {
      pointerEventsCheck: 0,
    })

    await userEvent.click(screen.getByRole('button', { name: 'Menu de navegação' }))
    expect(screen.getByRole('menuitem', { name: 'Modo claro' })).toBeInTheDocument()
  })
})
