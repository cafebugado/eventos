import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import ContributorsGrid from './ContributorsGrid'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('ContributorsGrid', () => {
  it('exibe mensagem de vazio quando não há contribuintes', () => {
    renderWithTheme(<ContributorsGrid contributors={[]} />)
    expect(screen.getByText('Nenhum contribuinte cadastrado ainda.')).toBeInTheDocument()
  })

  it('renderiza os contribuintes recebidos', () => {
    renderWithTheme(
      <ContributorsGrid
        contributors={[
          {
            id: '1',
            nome: 'Alice',
            avatar_url: 'https://example.com/a.png',
            github_url: 'https://github.com/alice',
            linkedin_url: 'https://linkedin.com/in/alice',
            portfolio_url: 'https://alice.dev',
          },
        ]}
      />
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'GitHub de Alice' })).toHaveAttribute(
      'href',
      'https://github.com/alice'
    )
    expect(screen.getByRole('link', { name: 'LinkedIn de Alice' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Portfólio de Alice' })).toBeInTheDocument()
  })

  it('não renderiza links opcionais quando ausentes', () => {
    renderWithTheme(
      <ContributorsGrid
        contributors={[
          {
            id: '1',
            nome: 'Bob',
            avatar_url: 'https://example.com/b.png',
            github_url: 'https://github.com/bob',
          },
        ]}
      />
    )
    expect(screen.queryByRole('link', { name: 'LinkedIn de Bob' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Portfólio de Bob' })).not.toBeInTheDocument()
  })
})
