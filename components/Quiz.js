'use client'
// QUIZ: mostra uma pergunta por vez, envia a resposta ao banco (função "responder") e exibe o resultado.
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { criarClienteNavegador } from '../lib/supabase/client'

export default function Quiz({ perguntas }) {
  const [i, setI] = useState(0)          // qual pergunta está na tela
  const [res, setRes] = useState(null)   // resultado devolvido pelo banco depois de responder
  const [escolha, setEscolha] = useState(null)
  const [total, setTotal] = useState(0)  // XP ganho nesta rodada
  const supabase = criarClienteNavegador()
  const router = useRouter()
  const q = perguntas[i]

  // Envia a opção escolhida. Quem confere o acerto e dá o XP é o BANCO, nunca o navegador.
  async function responder(k) {
    if (res) return
    setEscolha(k)
    const { data, error } = await supabase.rpc('responder', { p_pergunta: q.id, p_opcao: k })
    if (error) return setEscolha(null)
    setRes(data); setTotal((t) => t + data.xp)
    router.refresh() // limpa o cache do navegador, para o painel e o ranking mostrarem o XP novo
  }
  const proxima = () => { setRes(null); setEscolha(null); setI(i + 1) }

  // Acabaram as perguntas: tela final.
  if (!q) return (
    <div className="cartao">
      <h1>Rodada concluída!</h1>
      <p>Você ganhou {total} XP nesta rodada.</p>
      <div className="coluna"><Link className="botao" href="/aluno/atividades">Escolher outro assunto</Link></div>
    </div>
  )

  return (
    <div className="cartao">
      <p>Pergunta {i + 1} de {perguntas.length} · vale {q.xp} XP</p>
      <h1 style={{ fontSize: '1.5rem' }}>{q.enunciado}</h1>
      <div className="coluna">
        {q.opcoes.map((o, k) => (
          <button key={k} className={'sec ' + (res && k === res.certa ? 'ok' : res && k === escolha ? 'no' : '')}
                  disabled={!!res} onClick={() => responder(k)}>{o}</button>
        ))}
      </div>
      {res && (
        <div role="status">
          <p className="aviso">
            {res.correta ? (res.repetida ? 'Correto! Você já tinha ganhado o XP desta pergunta.' : `Correto! +${res.xp} XP`)
                         : 'Quase! A resposta certa está em verde.'}
          </p>
          <p>{res.explicacao}</p>
          <div className="coluna"><button onClick={proxima}>{i + 1 < perguntas.length ? 'Próxima pergunta' : 'Concluir'}</button></div>
        </div>
      )}
    </div>
  )
}
