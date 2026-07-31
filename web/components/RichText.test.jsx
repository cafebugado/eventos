import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import RichText from './RichText'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('RichText', () => {
  it('não renderiza nada quando content está vazio', () => {
    const { container } = renderWithTheme(<RichText content="" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renderiza parágrafos e negrito a partir de markdown simples', () => {
    renderWithTheme(<RichText content={'Primeira linha\n\n**Importante**'} />)
    expect(screen.getByText('Primeira linha')).toBeInTheDocument()
    expect(screen.getByText('Importante').tagName).toBe('STRONG')
  })

  it('converte links markdown em <a> com target blank', () => {
    renderWithTheme(<RichText content="[Café Bugado](https://cafebugado.com.br)" />)
    const link = screen.getByRole('link', { name: 'Café Bugado' })
    expect(link).toHaveAttribute('href', 'https://cafebugado.com.br')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('interrompe a propagação de clique em links quando stopPropagationOnLinks=true', async () => {
    const onClick = vi.fn()
    renderWithTheme(
      <div onClick={onClick}>
        <RichText content="[link](https://example.com)" stopPropagationOnLinks />
      </div>
    )
    screen.getByRole('link').click()
    expect(onClick).not.toHaveBeenCalled()
  })
})
