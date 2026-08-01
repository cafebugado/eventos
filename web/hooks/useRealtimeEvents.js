'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '../lib/supabase/client'

// Escuta INSERTs na tabela eventos em tempo real (Supabase Realtime) e chama
// onNewEvent pra cada evento novo *publicado*. Filtra por status=publicado
// no próprio channel pra rascunhos não gerarem notificação pro público.
export function useRealtimeEvents(onNewEvent) {
  const callbackRef = useRef(onNewEvent)

  // Atualiza a ref num effect (não durante o render) — mesmo padrão exigido
  // pela regra react-hooks/refs deste projeto.
  useEffect(() => {
    callbackRef.current = onNewEvent
  })

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('realtime:eventos')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'eventos', filter: 'status=eq.publicado' },
        (payload) => {
          if (payload.new) {
            callbackRef.current(payload.new)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
}
