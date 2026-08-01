import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Client Supabase para uso em Server Components/Route Handlers/Server Actions.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll chamado de um Server Component — pode ser ignorado se
            // houver middleware renovando a sessão (ver Fase 3 do plano).
          }
        },
      },
    }
  )
}
