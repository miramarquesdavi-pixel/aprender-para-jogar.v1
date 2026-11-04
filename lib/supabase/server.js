// Conexão com o Supabase para uso NO SERVIDOR (páginas que leem o perfil, rotas de login/saída).
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function criarClienteServidor() {
  const guarda = cookies() // cookies da requisição: é onde fica a sessão da pessoa
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => guarda.getAll(),
        // Salva a sessão renovada. O try/catch evita erro quando chamado de uma página (só leitura).
        setAll: (lista) => {
          try { lista.forEach(({ name, value, options }) => guarda.set(name, value, options)) } catch {}
        },
      },
    }
  )
}
