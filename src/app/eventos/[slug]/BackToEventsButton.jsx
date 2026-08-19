'use client'

import { useRouter } from 'next/navigation'
import BackButton from '../../../components/BackButton'

// Wrapper client-only: Server Components não podem passar funções (como
// `() => router.back()`) como prop para um Client Component, então o
// BackButton compartilhado (que só recebe onClick/label) é envolvido aqui.
export default function BackToEventsButton() {
  const router = useRouter()
  return <BackButton onClick={() => router.back()} label="Voltar para Eventos" />
}
