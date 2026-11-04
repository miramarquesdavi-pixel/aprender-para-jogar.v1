// Conexão com o Supabase para uso NO NAVEGADOR (botões de login, cadastro etc.).
import { createBrowserClient } from '@supabase/ssr'

export function criarClienteNavegador() {
  // As duas variáveis vêm do arquivo .env.local (veja o README).
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
