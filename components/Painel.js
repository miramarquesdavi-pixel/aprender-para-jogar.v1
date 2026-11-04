// Moldura comum a todas as áreas: barra do topo (marca, XP, sino, sair) e título da página.
import Link from 'next/link'
import { pegarPerfil } from '../lib/perfil'
import { criarClienteServidor } from '../lib/supabase/server'

export default async function Painel({ titulo, children }) {
  const p = await pegarPerfil()
  // Conta as notificações ainda não lidas (o banco só entrega as da própria pessoa).
  const { count } = await criarClienteServidor()
    .from('notificacoes').select('id', { count: 'exact', head: true }).eq('lida', false)
  return (
    <main className="pagina">
      <header className="barra-topo">
        <Link className="marca" href="/"><b>APJ</b>Aprender para Jogar</Link>
        <div className="direita">
          {/* Contador de XP e nível. Atualiza na hora quando o aluno responde (o Quiz chama router.refresh).
              Mantenha o 100 igual ao XP_POR_NIVEL de app/aluno/page.js. */}
          {(p.papel === 'aluno' || p.papel === 'professor') && (
            <span className="xp-pill" aria-live="polite">⭐ {p.xp} XP · Nível {Math.floor(p.xp / 100) + 1}</span>
          )}
          <Link className="botao sec" href="/notificacoes">🔔 {count ?? 0}</Link>
          {/* O botão envia um POST para /auth/sair, que encerra a sessão. */}
          <form action="/auth/sair" method="post"><button className="sec">Sair</button></form>
        </div>
      </header>
      <div style={{ padding: '2rem 0 .25rem' }}>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)' }}>{titulo}</h1>
        <p>{p.nome} · @{p.usuario}</p>
      </div>
      {children}
    </main>
  )
}
