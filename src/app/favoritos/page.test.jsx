import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import FavoritosPage, { metadata } from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('FavoritosPage', () => {
  it('define metadata de título, descrição e noindex', () => {
    expect(metadata.title).toMatch(/favoritos/i)
    expect(metadata.description).toBeTruthy()
    expect(metadata.robots).toEqual({ index: false, follow: true })
  })

  it('renderiza a página com tagsMap vazio (sem fonte de dados até a nova API ser plugada)', () => {
    renderWithTheme(FavoritosPage())

    expect(screen.getByRole('heading', { name: /meus favoritos/i })).toBeInTheDocument()
  })
})
