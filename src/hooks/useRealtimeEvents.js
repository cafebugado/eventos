import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useRealtimeEvents(onNewEvent) {
  const callbackRef = useRef(onNewEvent)
  callbackRef.current = onNewEvent

  useEffect(() => {
    const channel = supabase
      .channel('realtime:eventos')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'eventos' },
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
