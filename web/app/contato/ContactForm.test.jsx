import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import ContactForm from './ContactForm'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

describe('ContactForm', () => {
  it('exibe erros de validação ao enviar vazio', async () => {
    renderWithTheme(<ContactForm />)
    await userEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    expect(await screen.findByText('Nome deve ter pelo menos 2 caracteres')).toBeInTheDocument()
    expect(screen.getByText('Email é obrigatório')).toBeInTheDocument()
    expect(screen.getByText('Assunto é obrigatório')).toBeInTheDocument()
    expect(screen.getByText('Mensagem deve ter pelo menos 10 caracteres')).toBeInTheDocument()
  })

  it('exibe erro de email inválido', async () => {
    renderWithTheme(<ContactForm />)
    await userEvent.type(screen.getByLabelText('Seu email'), 'nao-e-email')
    await userEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    expect(await screen.findByText('Email inválido')).toBeInTheDocument()
  })

  it('envia e mostra confirmação quando todos os campos são válidos', async () => {
    renderWithTheme(<ContactForm />)
    await userEvent.type(screen.getByLabelText('Seu nome'), 'Maria')
    await userEvent.type(screen.getByLabelText('Seu email'), 'maria@example.com')
    await userEvent.type(screen.getByLabelText('Sobre o que você quer falar'), 'Parceria')
    await userEvent.type(
      screen.getByLabelText('Conte sua mensagem aqui'),
      'Gostaria de conversar sobre uma parceria.'
    )
    await userEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    expect(await screen.findByText('Mensagem enviada com sucesso!')).toBeInTheDocument()
    expect(screen.getByLabelText('Seu nome')).toHaveValue('')
  })
})
