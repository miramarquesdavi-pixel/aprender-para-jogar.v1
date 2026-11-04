// MINHAS DÚVIDAS: o aluno pergunta aos professores vinculados e acompanha as respostas.
import Link from 'next/link'
import Painel from '../../../components/Painel'
import FormDuvida from '../../../components/FormDuvida'
import { criarClienteServidor } from '../../../lib/supabase/server'

export default async function Duvidas() {
  const supabase = criarClienteServidor()
  const { data: vs } = await supabase.from('vinculos').select('professor_id, professor:perfis!professor_id(nome)').eq('status', 'aceito')
  const { data: duvidas } = await supabase.from('duvidas')
    .select('id, titulo, texto, resposta, criado_em, professor:perfis!professor_id(nome)').order('criado_em', { ascending: false })
  const professores = vs?.map((v) => ({ id: v.professor_id, nome: v.professor.nome })) ?? []

  return (
    <Painel titulo="Minhas dúvidas">
      <Link className="botao sec" href="/aluno">Voltar</Link>
      <div className="cartao">
        {professores.length
          ? <FormDuvida professores={professores} />
          : <p>Para enviar dúvidas, aceite o pedido de um professor em “Meus professores”.</p>}
      </div>
      <div className="cartao">
        {duvidas?.length ? duvidas.map((d) => (
          <div className="item" key={d.id}>
            <strong>{d.titulo}</strong> <p>para {d.professor.nome}</p>
            <p>{d.texto}</p>
            <p className={d.resposta ? 'aviso' : ''}>{d.resposta ? `Resposta: ${d.resposta}` : 'Aguardando resposta.'}</p>
          </div>
        )) : <p>Você ainda não enviou dúvidas.</p>}
      </div>
    </Painel>
  )
}
