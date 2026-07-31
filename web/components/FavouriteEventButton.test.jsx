import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { FavouriteEventButton } from './FavouriteEventButton'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

const event = { id: '1', nome: 'Evento Teste' }

describe('FavouriteEventButton', () => {
  it('renderiza como botão de texto quando isCard=false', () => {
    renderWithTheme(
      <FavouriteEventButton event={event} isFavourite={false} onToggle={vi.fn()} isCard={false} />
    )
    expect(screen.getByRole('button', { name: /favoritar/i })).toBeInTheDocument()
  })

  it('mostra "Remover dos favoritos" quando já favoritado', () => {
    renderWithTheme(
      <FavouriteEventButton event={event} isFavourite onToggle={vi.fn()} isCard={false} />
    )
    expect(screen.getByRole('button', { name: /remover dos favoritos/i })).toBeInTheDocument()
  })

  it('renderiza como ícone quando isCard=true', () => {
    renderWithTheme(
      <FavouriteEventButton event={event} isFavourite={false} onToggle={vi.fn()} isCard />
    )
    expect(screen.getByRole('button', { name: 'Favoritar' })).toBeInTheDocument()
  })

  it('chama onToggle com o id do evento e interrompe a propagação', async () => {
    const onToggle = vi.fn()
    const onParentClick = vi.fn()
    renderWithTheme(
      <div onClick={onParentClick}>
        <FavouriteEventButton event={event} isFavourite={false} onToggle={onToggle} isCard />
      </div>
    )

    await userEvent.click(screen.getByRole('button'))

    expect(onToggle).toHaveBeenCalledWith('1')
    expect(onParentClick).not.toHaveBeenCalled()
  })
})
