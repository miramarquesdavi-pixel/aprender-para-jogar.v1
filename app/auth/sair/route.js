// Rota do botão "Sair": encerra a sessão e volta para a página de entrada.
import { NextResponse } from 'next/server'
import { criarClienteServidor } from '../../../lib/supabase/server'

export async function POST(request) {
  await criarClienteServidor().auth.signOut()
  // status 303 faz o navegador abrir a página de entrada com um GET normal.
  return NextResponse.redirect(new URL('/', request.url), { status: 303 })
}
