import { useState } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from './Modal'
import ConfirmModal from './ConfirmModal'

export default {
  title: 'Design System/Modal',
}

function ModalDemo({ size, closeOnOverlay }) {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <>
      <Button variant="contained" onClick={() => setIsOpen(true)}>
        Abrir modal
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Título do modal"
        size={size}
        closeOnOverlay={closeOnOverlay}
        footer={
          <>
            <Button variant="outlined" color="inherit" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={() => setIsOpen(false)}>
              Confirmar
            </Button>
          </>
        }
      >
        <Typography>Conteúdo do modal.</Typography>
      </Modal>
    </>
  )
}

export const Padrao = {
  render: () => <ModalDemo size="md" closeOnOverlay />,
}

export const Pequeno = {
  render: () => <ModalDemo size="sm" closeOnOverlay />,
}

export const Grande = {
  render: () => <ModalDemo size="lg" closeOnOverlay />,
}

function ConfirmModalDemo(args) {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <>
      <Button variant="contained" color="error" onClick={() => setIsOpen(true)}>
        Excluir
      </Button>
      <ConfirmModal
        {...args}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => setIsOpen(false)}
      />
    </>
  )
}

export const Confirmacao = {
  render: () => (
    <ConfirmModalDemo
      title="Excluir evento"
      message="Tem certeza que deseja excluir este evento?"
    />
  ),
}

export const ConfirmacaoCarregando = {
  render: () => (
    <ConfirmModalDemo
      title="Excluir evento"
      message="Tem certeza que deseja excluir este evento?"
      isLoading
    />
  ),
}
