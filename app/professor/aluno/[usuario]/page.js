// PERFIL DE UM ALUNO (visão do professor): nível, XP e últimas atividades.
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Painel from '../../../../components/Painel'
import { criarClienteServidor } from '../../../../lib/supabase/server'

export default async function PerfilAluno({ params }) {
  const supabase = criarClienteServidor()
  // Se o aluno não for deste professor, o banco não devolve nada e a página dá "não encontrado".
  const { data: aluno } = await supabase.from('perfis').select('id, nome, usuario, xp').eq('usuario', params.usuario).eq('papel', 'aluno').single()
  if (!aluno) notFound()
  const { data: hist } = await supabase.from('xp_historico').select('quantidade, motivo, criado_em')
    .eq('aluno_id', aluno.id).order('criado_em', { ascending: false }).limit(10)

  return (
    <Painel titulo={aluno.nome}>
      <Link className="botao sec" href="/professor">Voltar</Link>
      <div className="cartao">
        <p>@{aluno.usuario}</p>
        <div className="nivel">Nível {Math.floor(aluno.xp / 100) + 1}</div>
        <p>{aluno.xp} XP no total</p>
      </div>
      <div className="cartao">
        <p>Últimas atividades</p>
        <table><tbody>
          {hist?.map((h, k) => <tr key={k}><td>{new Date(h.criado_em).toLocaleDateString('pt-BR')}</td><td>{h.motivo}</td><td>+{h.quantidade} XP</td></tr>)}
        </tbody></table>
      </div>
    </Painel>
  )
}
