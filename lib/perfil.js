// Busca o perfil de quem está logado. Use nas páginas protegidas.
import { redirect } from 'next/navigation'
import { criarClienteServidor } from './supabase/server'

export async function pegarPerfil() {
  const supabase = criarClienteServidor()
  // getUser() confere a sessão direto no Supabase (mais seguro do que confiar só no cookie).
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/') // sem login: volta para a página de entrada
  const { data } = await supabase
    .from('perfis').select('nome, usuario, papel, xp, avatar').eq('id', user.id).single()
  return data
}
