// Rota que recebe a pessoa de volta do Google/Microsoft ou do link de e-mail.
// Troca o "código" recebido por uma sessão (login de verdade) e segue para a página certa.
import { NextResponse } from 'next/server'
import { criarClienteServidor } from '../../../lib/supabase/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const codigo = searchParams.get('code')
  // "next" só aceita caminhos internos (começam com "/"), para ninguém redirecionar a pessoa para outro site.
  const proximo = searchParams.get('next')
  const destino = proximo && proximo.startsWith('/') && !proximo.startsWith('//') ? proximo : '/'

  if (codigo) await criarClienteServidor().auth.exchangeCodeForSession(codigo)
  return NextResponse.redirect(`${origin}${destino}`)
}
