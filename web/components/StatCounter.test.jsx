import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import StatCounter from './StatCounter'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

let originalIntersectionObserver

beforeEach(() => {
  originalIntersectionObserver = window.IntersectionObserver
  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback
    }
    observe() {
      this.callback([{ isIntersecting: true }])
    }
    disconnect() {}
  }
  // performance.now() avança 3000ms a cada chamada — garante que o primeiro
  // tick já ultrapasse a duração da animação (2000ms), terminando em uma
  // única iteração em vez de girar em loop síncrono (o que travaria o teste).
  // Um valor fixo (0 depois N) é frágil aqui: qualquer chamada extra a
  // performance.now() feita por código fora do nosso controle (React,
  // jsdom, etc.) antes do efeito rodar consumiria o valor esperado e faria a
  // animação nunca progredir — daí o contador sempre-crescente.
  let now = 0
  vi.spyOn(performance, 'now').mockImplementation(() => {
    now += 3000
    return now
  })
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(performance.now())
    return 0
  })
})

afterEach(() => {
  window.IntersectionObserver = originalIntersectionObserver
  vi.restoreAllMocks()
})

describe('StatCounter', () => {
  it('renderiza o label e anima até o valor final ao entrar na viewport', async () => {
    renderWithTheme(<StatCounter value={10} suffix="+" label="Eventos" />)
    expect(screen.getByText('Eventos')).toBeInTheDocument()
    expect(await screen.findByText('10+')).toBeInTheDocument()
  })
})
