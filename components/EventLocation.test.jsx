import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import EventLocation from './EventLocation'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('EventLocation', () => {
  it('não renderiza nada quando modalidade é Online', () => {
    const { container } = renderWithTheme(<EventLocation cidade="São Paulo" modalidade="Online" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('não renderiza nada quando não há endereço nem cidade', () => {
    const { container } = renderWithTheme(<EventLocation modalidade="Presencial" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renderiza endereço, cidade/estado e link do Google Maps', () => {
    renderWithTheme(
      <EventLocation
        endereco="Rua Teste, 100"
        cidade="São Paulo"
        estado="SP"
        modalidade="Presencial"
      />
    )
    expect(screen.getByText('Rua Teste, 100')).toBeInTheDocument()
    expect(screen.getByText('São Paulo - SP')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /ver no google maps/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('google.com/maps'))
  })
})
