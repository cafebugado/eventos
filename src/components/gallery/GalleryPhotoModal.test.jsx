import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import GalleryPhotoModal from './GalleryPhotoModal'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const event = {
  eventName: 'Meetup React',
  photos: [
    {
      id: 'p1',
      url: 'https://example.com/1.png',
      thumb: 'https://example.com/1.png',
      caption: 'Foto 1',
    },
    {
      id: 'p2',
      url: 'https://example.com/2.png',
      thumb: 'https://example.com/2.png',
      caption: 'Foto 2',
    },
  ],
}

describe('GalleryPhotoModal', () => {
  it('renderiza a foto atual e o contador', () => {
    renderWithTheme(
      <GalleryPhotoModal
        event={event}
        photoIndex={0}
        onClose={vi.fn()}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onGoTo={vi.fn()}
      />
    )
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    expect(screen.getByText('Foto 1')).toBeInTheDocument()
  })

  it('desabilita "anterior" na primeira foto e "próxima" na última', () => {
    const { rerender } = renderWithTheme(
      <GalleryPhotoModal
        event={event}
        photoIndex={0}
        onClose={vi.fn()}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onGoTo={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Foto anterior' })).toBeDisabled()

    rerender(
      <ThemeProvider theme={createTheme()}>
        <GalleryPhotoModal
          event={event}
          photoIndex={1}
          onClose={vi.fn()}
          onPrev={vi.fn()}
          onNext={vi.fn()}
          onGoTo={vi.fn()}
        />
      </ThemeProvider>
    )
    expect(screen.getByRole('button', { name: 'Próxima foto' })).toBeDisabled()
  })

  it('chama onClose ao clicar no botão de fechar', async () => {
    const onClose = vi.fn()
    renderWithTheme(
      <GalleryPhotoModal
        event={event}
        photoIndex={0}
        onClose={onClose}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onGoTo={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('chama onClose ao pressionar Escape', async () => {
    const onClose = vi.fn()
    renderWithTheme(
      <GalleryPhotoModal
        event={event}
        photoIndex={0}
        onClose={onClose}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onGoTo={vi.fn()}
      />
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('chama onGoTo ao clicar em uma miniatura', async () => {
    const onGoTo = vi.fn()
    renderWithTheme(
      <GalleryPhotoModal
        event={event}
        photoIndex={0}
        onClose={vi.fn()}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onGoTo={onGoTo}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Ir para foto 2' }))
    expect(onGoTo).toHaveBeenCalledWith(1)
  })
})
