import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import ContactForm from './ContactForm'

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

// delay: null remove o atraso artificial entre keystrokes do userEvent.type —
// sem isso, digitar strings maiores (como a mensagem abaixo) fica lento o
// bastante sob carga (suíte inteira rodando em paralelo) para estourar o
// timeout padrão do teste.
function setupUser() {
  return userEvent.setup({ delay: null })
}

describe('ContactForm', () => {
  it('exibe erros de validação ao enviar vazio', async () => {
    const user = setupUser()
    renderWithTheme(<ContactForm />)
    await user.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    expect(await screen.findByText('Nome deve ter pelo menos 2 caracteres')).toBeInTheDocument()
    expect(screen.getByText('Email é obrigatório')).toBeInTheDocument()
    expect(screen.getByText('Assunto é obrigatório')).toBeInTheDocument()
    expect(screen.getByText('Mensagem deve ter pelo menos 10 caracteres')).toBeInTheDocument()
  })

  it('exibe erro de email inválido', async () => {
    const user = setupUser()
    renderWithTheme(<ContactForm />)
    await user.type(screen.getByLabelText('Seu email'), 'nao-e-email')
    await user.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    expect(await screen.findByText('Email inválido')).toBeInTheDocument()
  })

  // Timeout maior: preenche 4 campos com userEvent.type (~70 keystrokes) —
  // sob a suíte inteira rodando em paralelo (dezenas de arquivos), isso pode
  // passar dos 5000ms padrão mesmo com delay:null.
  it('envia e mostra confirmação quando todos os campos são válidos', async () => {
    const user = setupUser()
    renderWithTheme(<ContactForm />)
    await user.type(screen.getByLabelText('Seu nome'), 'Maria')
    await user.type(screen.getByLabelText('Seu email'), 'maria@example.com')
    await user.type(screen.getByLabelText('Sobre o que você quer falar'), 'Parceria')
    await user.type(
      screen.getByLabelText('Conte sua mensagem aqui'),
      'Gostaria de conversar sobre uma parceria.'
    )
    await user.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    expect(await screen.findByText('Mensagem enviada com sucesso!')).toBeInTheDocument()
    expect(screen.getByLabelText('Seu nome')).toHaveValue('')
  }, 15000)
})
