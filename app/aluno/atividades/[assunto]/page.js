// UM ASSUNTO: carrega as perguntas dele e entrega para o componente Quiz.
import Link from 'next/link'
import Painel from '../../../../components/Painel'
import Quiz from '../../../../components/Quiz'
import { criarClienteServidor } from '../../../../lib/supabase/server'

export default async function Assunto({ params }) {
  // Só pede as colunas liberadas: a resposta certa ("correta") o banco não entrega ao navegador.
  const { data: perguntas } = await criarClienteServidor()
    .from('perguntas').select('id, enunciado, opcoes, xp').eq('assunto_id', params.assunto).order('xp')

  return (
    <Painel titulo="Atividade">
      {perguntas?.length
        ? <Quiz perguntas={perguntas} />
        : <div className="cartao"><p>Ainda não há perguntas neste assunto.</p><Link className="botao sec" href="/aluno/atividades">Voltar</Link></div>}
    </Painel>
  )
}
