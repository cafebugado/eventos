import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventsPage, { metadata } from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/eventos',
  useSearchParams: () => new URLSearchParams(),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('EventsPage', () => {
  it('define metadata de título e descrição', () => {
    expect(metadata.title).toMatch(/próximos eventos/i)
    expect(metadata.description).toBeTruthy()
  })

  it('renderiza estado de erro (sem fonte de dados até a nova API ser plugada)', () => {
    renderWithTheme(EventsPage())

    expect(screen.getByText('Erro ao carregar eventos')).toBeInTheDocument()
  })
})
