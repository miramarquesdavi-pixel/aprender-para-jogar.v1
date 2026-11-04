// MEUS PROFESSORES: o aluno aceita ou recusa pedidos de vínculo e vê quem já acompanha ele.
import Link from 'next/link'
import Painel from '../../../components/Painel'
import BotaoRpc from '../../../components/BotaoRpc'
import { criarClienteServidor } from '../../../lib/supabase/server'

export default async function Professores() {
  // "perfis!professor_id" diz ao banco qual ligação usar para trazer os dados do professor.
  const { data: vs } = await criarClienteServidor()
    .from('vinculos').select('professor_id, status, professor:perfis!professor_id(nome, usuario)')
  const pendentes = vs?.filter((v) => v.status === 'pendente') ?? []
  const aceitos = vs?.filter((v) => v.status === 'aceito') ?? []
  return (
    <Painel titulo="Meus professores">
      <Link className="botao sec" href="/aluno">Voltar</Link>
      <div className="cartao">
        <p>Pedidos esperando sua resposta</p>
        {pendentes.length === 0 && <p>Nenhum pedido no momento.</p>}
        {pendentes.map((v) => (
          <div className="item" key={v.professor_id}>
            <p>{v.professor.nome} (@{v.professor.usuario}) quer acompanhar seu progresso.</p>
            <div className="topo" style={{ justifyContent: 'flex-start' }}>
              <BotaoRpc fn="responder_vinculo" args={{ p_professor: v.professor_id, p_aceitar: true }} rotulo="Aceitar" />
              <BotaoRpc fn="responder_vinculo" args={{ p_professor: v.professor_id, p_aceitar: false }} rotulo="Recusar" sec />
            </div>
          </div>
        ))}
      </div>
      <div className="cartao">
        <p>Quem acompanha você</p>
        {aceitos.length === 0 && <p>Você ainda não tem professores vinculados.</p>}
        {aceitos.map((v) => <div className="item" key={v.professor_id}>{v.professor.nome} (@{v.professor.usuario})</div>)}
      </div>
    </Painel>
  )
}
