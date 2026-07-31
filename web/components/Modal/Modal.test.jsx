import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Modal from './Modal'
import ConfirmModal from './ConfirmModal'

afterEach(cleanup)

function renderWithTheme(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>)
}

function clickBackdrop() {
  fireEvent.click(document.querySelector('.MuiBackdrop-root'))
}

// ─── Modal base ───────────────────────────────────────────────────────────────

describe('Modal', () => {
  it('não renderiza quando isOpen=false', () => {
    renderWithTheme(
      <Modal isOpen={false} title="Teste" onClose={() => {}}>
        conteúdo
      </Modal>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza quando isOpen=true', () => {
    renderWithTheme(
      <Modal isOpen title="Teste" onClose={() => {}}>
        conteúdo
      </Modal>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Teste')).toBeInTheDocument()
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
  })

  it('chama onClose ao clicar no overlay', () => {
    const onClose = vi.fn()
    renderWithTheme(
      <Modal isOpen title="Teste" onClose={onClose}>
        conteúdo
      </Modal>
    )
    clickBackdrop()
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('não chama onClose ao clicar dentro do conteúdo', () => {
    const onClose = vi.fn()
    renderWithTheme(
      <Modal isOpen title="Teste" onClose={onClose}>
        <button>interno</button>
      </Modal>
    )
    fireEvent.click(screen.getByText('interno'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('chama onClose ao clicar no botão de fechar', async () => {
    const onClose = vi.fn()
    renderWithTheme(
      <Modal isOpen title="Teste" onClose={onClose}>
        x
      </Modal>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('chama onClose ao pressionar Escape', () => {
    const onClose = vi.fn()
    renderWithTheme(
      <Modal isOpen title="Teste" onClose={onClose}>
        x
      </Modal>
    )
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('não fecha ao clicar no overlay quando closeOnOverlay=false', () => {
    const onClose = vi.fn()
    renderWithTheme(
      <Modal isOpen title="Teste" onClose={onClose} closeOnOverlay={false}>
        x
      </Modal>
    )
    clickBackdrop()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renderiza footer quando prop footer é fornecida', () => {
    renderWithTheme(
      <Modal isOpen title="Teste" onClose={() => {}} footer={<button>Confirmar</button>}>
        x
      </Modal>
    )
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument()
  })

  it('não renderiza footer quando footer=null', () => {
    renderWithTheme(
      <Modal isOpen title="Teste" onClose={() => {}} footer={null}>
        x
      </Modal>
    )
    expect(document.querySelector('.MuiDialogActions-root')).not.toBeInTheDocument()
  })

  it('renderiza via portal no document.body', () => {
    const { baseElement } = renderWithTheme(
      <Modal isOpen title="Teste" onClose={() => {}}>
        x
      </Modal>
    )
    expect(baseElement.querySelector('.MuiDialog-root')).toBeInTheDocument()
  })
})

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

describe('ConfirmModal', () => {
  it('renderiza título, mensagem e botões padrão', () => {
    renderWithTheme(
      <ConfirmModal
        isOpen
        title="Excluir Item"
        message="Tem certeza?"
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByRole('heading', { name: 'Excluir Item' })).toBeInTheDocument()
    expect(screen.getByText('Tem certeza?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument()
  })

  it('chama onClose ao clicar em Cancelar', async () => {
    const onClose = vi.fn()
    renderWithTheme(
      <ConfirmModal isOpen title="X" message="msg" onClose={onClose} onConfirm={() => {}} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('chama onConfirm ao clicar no botão confirmar', async () => {
    const onConfirm = vi.fn()
    renderWithTheme(
      <ConfirmModal isOpen title="X" message="msg" onClose={() => {}} onConfirm={onConfirm} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('usa confirmLabel e cancelLabel personalizados', () => {
    renderWithTheme(
      <ConfirmModal
        isOpen
        title="X"
        message="msg"
        onClose={() => {}}
        onConfirm={() => {}}
        confirmLabel="Sim, remover"
        cancelLabel="Não"
      />
    )
    expect(screen.getByRole('button', { name: 'Sim, remover' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Não' })).toBeInTheDocument()
  })

  it('desabilita botões quando isLoading=true', () => {
    renderWithTheme(
      <ConfirmModal
        isOpen
        title="X"
        message="msg"
        onClose={() => {}}
        onConfirm={() => {}}
        isLoading
      />
    )
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /excluir/i })).toBeDisabled()
  })

  it('não renderiza quando isOpen=false', () => {
    renderWithTheme(
      <ConfirmModal
        isOpen={false}
        title="X"
        message="msg"
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('aceita ReactNode como message', () => {
    renderWithTheme(
      <ConfirmModal
        isOpen
        title="X"
        message={
          <span>
            Excluir <strong>Cafe Bugado</strong>?
          </span>
        }
        onClose={() => {}}
        onConfirm={() => {}}
      />
    )
    expect(screen.getByText('Cafe Bugado')).toBeInTheDocument()
  })
})
