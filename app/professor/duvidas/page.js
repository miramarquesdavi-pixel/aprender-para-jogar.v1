// DÚVIDAS DOS ALUNOS (visão do professor): responde as pendentes e consulta o histórico.
import Link from 'next/link'
import Painel from '../../../components/Painel'
import ResponderDuvida from '../../../components/ResponderDuvida'
import { criarClienteServidor } from '../../../lib/supabase/server'

export default async function DuvidasProfessor() {
  // O banco só devolve as dúvidas endereçadas a este professor.
  const { data: duvidas } = await criarClienteServidor().from('duvidas')
    .select('id, titulo, texto, resposta, criado_em, aluno:perfis!aluno_id(nome, usuario)').order('criado_em', { ascending: false })
  return (
    <Painel titulo="Dúvidas dos alunos">
      <Link className="botao sec" href="/professor">Voltar</Link>
      <div className="cartao">
        {duvidas?.length ? duvidas.map((d) => (
          <div className="item" key={d.id}>
            <strong>{d.titulo}</strong> <p>{d.aluno?.nome} (@{d.aluno?.usuario}) · {new Date(d.criado_em).toLocaleDateString('pt-BR')}</p>
            <p>{d.texto}</p>
            {d.resposta ? <p className="aviso">Respondida: {d.resposta}</p> : <ResponderDuvida id={d.id} />}
          </div>
        )) : <p>Nenhuma dúvida recebida ainda.</p>}
      </div>
    </Painel>
  )
}
