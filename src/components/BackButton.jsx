import { ArrowLeft } from 'lucide-react'
import './BackButton.css'

/**
 * Botão de voltar reutilizável.
 *
 * Props:
 *  - onClick: função chamada ao clicar (obrigatório)
 *  - label: texto do botão (padrão: "Voltar")
 */
function BackButton({ onClick, label = 'Voltar' }) {
  return (
    <button className="back-btn" onClick={onClick}>
      <ArrowLeft size={18} />
      <span>{label}</span>
    </button>
  )
}

export default BackButton
