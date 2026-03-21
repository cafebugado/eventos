import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from './Modal'
import ConfirmModal from './ConfirmModal'

afterEach(() => {
  cleanup()
  document.body.style.overflow = ''
})

// ─── Modal base ───────────────────────────────────────────────────────────────

describe('Modal', () => {
  it('não renderiza quando isOpen=false', () => {
    render(
      <Modal isOpen={false} title="Teste" onClose={() => {}}>
        conteúdo
      </Modal>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza quando isOpen=true', () => {
    render(
      <Modal isOpen title="Teste" onClose={() => {}}>
        conteúdo
      </Modal>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Teste')).toBeInTheDocument()
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
  })

  it('tem aria-modal="true" e aria-labelledby correto', () => {
    render(
      <Modal isOpen title="Acessível" onClose={() => {}}>
        x
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
    expect(screen.getByText('Acessível').id).toBe('modal-title')
  })

  it('chama onClose ao clicar no overlay', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen title="Teste" onClose={onClose}>
        conteúdo
      </Modal>
    )
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('não chama onClose ao clicar dentro do conteúdo', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen title="Teste" onClose={onClose}>
        <button>interno</button>
      </Modal>
    )
    fireEvent.click(screen.getByText('interno'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('chama onClose ao clicar no botão X', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal isOpen title="Teste" onClose={onClose}>
        x
      </Modal>
    )
    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('chama onClose ao pressionar Escape', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen title="Teste" onClose={onClose}>
        x
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('não chama onClose no Escape quando isOpen=false', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={false} title="Teste" onClose={onClose}>
        x
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('não fecha ao clicar no overlay quando closeOnOverlay=false', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen title="Teste" onClose={onClose} closeOnOverlay={false}>
        x
      </Modal>
    )
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('aplica a classe de tamanho correta — sm', () => {
    render(
      <Modal isOpen title="Teste" onClose={() => {}} size="sm">
        x
      </Modal>
    )
    expect(document.querySelector('.modal-content--sm')).toBeInTheDocument()
  })

  it('aplica a classe de tamanho correta — md (padrão)', () => {
    render(
      <Modal isOpen title="Teste" onClose={() => {}}>
        x
      </Modal>
    )
    expect(document.querySelector('.modal-content--md')).toBeInTheDocument()
  })

  it('aplica a classe de tamanho correta — lg', () => {
    render(
      <Modal isOpen title="Teste" onClose={() => {}} size="lg">
        x
      </Modal>
    )
    expect(document.querySelector('.modal-content--lg')).toBeInTheDocument()
  })

  it('renderiza footer quando prop footer é fornecida', () => {
    render(
      <Modal isOpen title="Teste" onClose={() => {}} footer={<button>Confirmar</button>}>
        x
      </Modal>
    )
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument()
    expect(document.querySelector('.modal-footer')).toBeInTheDocument()
  })

  it('não renderiza footer quando footer=null', () => {
    render(
      <Modal isOpen title="Teste" onClose={() => {}} footer={null}>
        x
      </Modal>
    )
    expect(document.querySelector('.modal-footer')).not.toBeInTheDocument()
  })

  it('trava scroll do body quando aberto e restaura ao fechar', () => {
    const { rerender } = render(
      <Modal isOpen title="Teste" onClose={() => {}}>
        x
      </Modal>
    )
    expect(document.body.style.overflow).toBe('hidden')

    rerender(
      <Modal isOpen={false} title="Teste" onClose={() => {}}>
        x
      </Modal>
    )
    expect(document.body.style.overflow).toBe('')
  })

  it('renderiza via portal no document.body', () => {
    const { container } = render(
      <Modal isOpen title="Teste" onClose={() => {}}>
        x
      </Modal>
    )
    // O portal renderiza em document.body, não no container do render
    expect(container.querySelector('.modal-overlay')).not.toBeInTheDocument()
    expect(document.body.querySelector('.modal-overlay')).toBeInTheDocument()
  })
})

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

describe('ConfirmModal', () => {
  it('renderiza título, mensagem e botões padrão', () => {
    render(
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
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ConfirmModal isOpen title="X" message="msg" onClose={onClose} onConfirm={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('chama onConfirm ao clicar no botão confirmar', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<ConfirmModal isOpen title="X" message="msg" onClose={() => {}} onConfirm={onConfirm} />)
    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('usa confirmLabel e cancelLabel personalizados', () => {
    render(
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
    render(
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
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeDisabled()
  })

  it('aplica btn-danger por padrão no botão confirmar', () => {
    render(<ConfirmModal isOpen title="X" message="msg" onClose={() => {}} onConfirm={() => {}} />)
    expect(screen.getByRole('button', { name: 'Excluir' })).toHaveClass('btn-danger')
  })

  it('aplica btn-primary quando confirmVariant="primary"', () => {
    render(
      <ConfirmModal
        isOpen
        title="X"
        message="msg"
        onClose={() => {}}
        onConfirm={() => {}}
        confirmVariant="primary"
        confirmLabel="Salvar"
      />
    )
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveClass('btn-primary')
  })

  it('não renderiza quando isOpen=false', () => {
    render(
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

  it('fecha com Escape chamando onClose', () => {
    const onClose = vi.fn()
    render(<ConfirmModal isOpen title="X" message="msg" onClose={onClose} onConfirm={() => {}} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('aceita ReactNode como message', () => {
    render(
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

  it('usa tamanho sm por padrão', () => {
    render(<ConfirmModal isOpen title="X" message="msg" onClose={() => {}} onConfirm={() => {}} />)
    expect(document.querySelector('.modal-content--sm')).toBeInTheDocument()
  })
})
