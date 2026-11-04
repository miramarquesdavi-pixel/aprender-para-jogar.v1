// NOTIFICAÇÕES: lista os avisos da pessoa (qualquer tipo de acesso) e permite marcar tudo como lido.
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import Painel from '../../components/Painel'
import { criarClienteServidor } from '../../lib/supabase/server'

// Ação do botão "Marcar como lidas": roda no servidor; o banco só altera as notificações da própria pessoa.
async function marcarLidas() {
  'use server'
  await criarClienteServidor().from('notificacoes').update({ lida: true }).eq('lida', false)
  revalidatePath('/notificacoes')
}

export default async function Notificacoes() {
  const { data: lista } = await criarClienteServidor()
    .from('notificacoes').select('id, texto, link, lida, criado_em').order('criado_em', { ascending: false }).limit(30)
  return (
    <Painel titulo="Notificações">
      <div className="topo" style={{ marginTop: '1rem' }}>
        <Link className="botao sec" href="/">Voltar</Link>
        <form action={marcarLidas}><button className="sec">Marcar como lidas</button></form>
      </div>
      <div className="cartao">
        {lista?.length ? lista.map((n) => (
          <div className="item" key={n.id} style={{ opacity: n.lida ? 0.6 : 1 }}>
            {n.link ? <Link href={n.link}>{n.texto}</Link> : n.texto}
            <p>{new Date(n.criado_em).toLocaleString('pt-BR')}</p>
          </div>
        )) : <p>Nenhuma notificação por enquanto.</p>}
      </div>
    </Painel>
  )
}
