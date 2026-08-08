import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import GalleryPage, { metadata } from './page'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('GalleryPage', () => {
  it('define metadata de título e descrição', () => {
    expect(metadata.title).toMatch(/galeria/i)
    expect(metadata.description).toBeTruthy()
  })

  it('exibe estado de erro (sem fonte de dados até a nova API ser plugada)', () => {
    renderWithTheme(GalleryPage())

    expect(screen.getByText(/erro ao carregar a galeria/i)).toBeInTheDocument()
  })
})
