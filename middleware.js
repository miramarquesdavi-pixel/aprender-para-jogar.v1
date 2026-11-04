// PORTEIRO DO SITE: roda antes de cada página e decide quem pode entrar onde.
// É aqui (no servidor) que o aluno é impedido de abrir a área do professor, e assim por diante.
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Página inicial de cada tipo de acesso. Para criar uma área nova, acrescente uma linha aqui.
const AREA = { aluno: '/aluno', professor: '/professor', dono: '/dono', empresa: '/empresa' }

export async function middleware(request) {
  let resposta = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        // Mantém a sessão renovada nos cookies da resposta.
        setAll: (lista) => {
          lista.forEach(({ name, value }) => request.cookies.set(name, value))
          resposta = NextResponse.next({ request })
          lista.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const caminho = request.nextUrl.pathname
  // Descobre se a página pedida pertence a alguma área restrita.
  const areaPedida = Object.keys(AREA).find((p) => caminho.startsWith(AREA[p]))
  const ir = (rota) => NextResponse.redirect(new URL(rota, request.url))

  // 1) Sem login: só a página de entrada é liberada.
  if (!user) return areaPedida ? ir('/') : resposta

  // 2) Com login: descobre o tipo de acesso no banco (quem decide é o servidor, nunca o navegador).
  const { data: perfil } = await supabase.from('perfis').select('papel').eq('id', user.id).single()
  const papel = perfil?.papel ?? 'aluno'

  // 3) Logado na página de entrada, ou numa área que não é a sua: manda para a área certa.
  if (caminho === '/' || (areaPedida && areaPedida !== papel)) return ir(AREA[papel])
  return resposta
}

// Não roda o porteiro em arquivos estáticos e imagens.
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)'] }
