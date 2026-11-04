// RANKING GERAL: top 10 dos alunos + a posição do próprio aluno (mesmo que esteja fora do top 10).
import Link from 'next/link'
import Painel from '../../../components/Painel'
import { criarClienteServidor } from '../../../lib/supabase/server'

export default async function Ranking() {
  const { data: linhas } = await criarClienteServidor().rpc('ranking_geral')
  return (
    <Painel titulo="Ranking">
      <Link className="botao sec" href="/aluno">Voltar</Link>
      <div className="cartao">
        <p>Cada acerto novo coloca você mais perto do topo. Só conta a primeira vez que você acerta cada pergunta.</p>
        <table>
          <thead><tr><th>#</th><th>Jogador</th><th>XP</th></tr></thead>
          <tbody>
            {linhas?.map((l) => (
              <tr key={l.usuario} className={l.eu ? 'eu' : ''}>
                <td>{l.posicao}</td><td>{l.nome} (@{l.usuario}){l.eu ? ' · você' : ''}</td><td>{l.xp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Painel>
  )
}
