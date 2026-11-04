// Moldura comum a todas as áreas: título, nome, @usuario, sino de notificações e botão Sair.
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
      <div className="topo">
        <div>
          <h1>{titulo}</h1>
          <p>{p.nome} · @{p.usuario}</p>
        </div>
        <div className="topo">
          <Link className="botao sec" href="/notificacoes">🔔 {count ?? 0}</Link>
          {/* O botão envia um POST para /auth/sair, que encerra a sessão. */}
          <form action="/auth/sair" method="post"><button className="sec">Sair</button></form>
        </div>
      </div>
      {children}
    </main>
  )
}
