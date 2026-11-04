// ÁREA DO PROFESSOR: lista os alunos vinculados e permite adicionar mais pelo @usuario.
import Link from 'next/link'
import Painel from '../../components/Painel'
import VincularAluno from '../../components/VincularAluno'
import { criarClienteServidor } from '../../lib/supabase/server'

export default async function Professor() {
  // O banco só devolve os alunos vinculados a este professor (regra "professor ve alunos").
  const { data: alunos } = await criarClienteServidor()
    .from('perfis').select('nome, usuario, xp').eq('papel', 'aluno').order('nome')

  return (
    <Painel titulo="Meus alunos">
      <Link className="botao sec" href="/professor/duvidas">Dúvidas dos alunos</Link>
      <div className="cartao">
        {alunos?.length ? (
          <table>
            <thead><tr><th>Aluno</th><th>XP</th></tr></thead>
            <tbody>
              {alunos.map((a) => (
                <tr key={a.usuario}><td><Link href={`/professor/aluno/${a.usuario}`}>{a.nome} (@{a.usuario})</Link></td><td>{a.xp}</td></tr>
              ))}
            </tbody>
          </table>
        ) : <p>Você ainda não tem alunos. Adicione o primeiro pelo @usuario.</p>}
      </div>
      <div className="cartao"><VincularAluno /></div>
    </Painel>
  )
}
