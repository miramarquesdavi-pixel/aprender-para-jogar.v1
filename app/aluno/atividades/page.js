// ATIVIDADES: lista as matérias e seus assuntos. O aluno escolhe qualquer um, sem ordem obrigatória.
import Link from 'next/link'
import Painel from '../../../components/Painel'
import { criarClienteServidor } from '../../../lib/supabase/server'

export default async function Atividades() {
  // Busca as matérias já com seus assuntos dentro (uma consulta só).
  const { data: materias } = await criarClienteServidor()
    .from('materias').select('id, nome, icone, assuntos(id, nome)').order('nome')

  return (
    <Painel titulo="Atividades">
      <Link className="botao sec" href="/aluno">Voltar</Link>
      <div className="grade">
        {materias?.map((m) => (
          <div className="cartao" key={m.id} style={{ marginTop: 0 }}>
            <h1 style={{ fontSize: '1.3rem' }}>{m.icone} {m.nome}</h1>
            <div className="coluna">
              {m.assuntos.length === 0 && <p>Assuntos em breve.</p>}
              {m.assuntos.map((a) => <Link key={a.id} className="botao sec" href={`/aluno/atividades/${a.id}`}>{a.nome}</Link>)}
            </div>
          </div>
        ))}
      </div>
    </Painel>
  )
}
