// ÁREA DO ALUNO: painel "Início". Só entra quem tem papel "aluno" (o porteiro, middleware.js, garante isso).
// Todos os números abaixo vêm do banco de dados: nada aqui é de enfeite.
import Link from 'next/link'
import Painel from '../../components/Painel'
import { pegarPerfil } from '../../lib/perfil'
import { criarClienteServidor } from '../../lib/supabase/server'

// REGRA DE NÍVEL: a cada 100 XP o aluno sobe um nível. Mude o número abaixo para ajustar.
const XP_POR_NIVEL = 100

// Transforma uma data em "há 5 min", "há 2 h" ou "há 3 d".
function quando(data) {
  const min = Math.round((Date.now() - new Date(data).getTime()) / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.round(min / 60)
  return h < 24 ? `há ${h} h` : `há ${Math.round(h / 24)} d`
}

export default async function Aluno() {
  const p = await pegarPerfil()
  const supabase = criarClienteServidor()
  // Três consultas ao mesmo tempo: matérias, todas as perguntas e as perguntas que o aluno já acertou.
  const [{ data: materias }, { data: perguntas }, { data: ganhos }] = await Promise.all([
    supabase.from('materias').select('id, nome, icone').order('nome'),
    supabase.from('perguntas').select('id, assuntos(materia_id)'),
    supabase.from('xp_historico').select('pergunta_id, quantidade, criado_em, perguntas(assuntos(nome))')
      .not('pergunta_id', 'is', null).order('criado_em', { ascending: false }),
  ])

  const nivel = Math.floor(p.xp / XP_POR_NIVEL) + 1
  const noNivel = p.xp % XP_POR_NIVEL // XP já ganho dentro do nível atual
  const acertadas = new Set((ganhos ?? []).map((g) => g.pergunta_id))
  // PROGRESSO GERAL: porcentagem das perguntas da plataforma que o aluno já acertou.
  const geral = perguntas?.length ? Math.round((100 * acertadas.size) / perguntas.length) : 0
  // PROGRESSO POR MATÉRIA (só matérias que já têm perguntas).
  const porMateria = (materias ?? []).map((m) => {
    const daMateria = (perguntas ?? []).filter((q) => q.assuntos?.materia_id === m.id)
    const feitas = daMateria.filter((q) => acertadas.has(q.id)).length
    return { ...m, total: daMateria.length, pct: daMateria.length ? Math.round((100 * feitas) / daMateria.length) : 0 }
  }).filter((m) => m.total > 0)

  return (
    <Painel titulo="Meu painel" semTitulo cheia>
      <div className="painel-grid">
        {/* Boas-vindas */}
        <section className="cartao hero-aluno c8">
          <h1>Olá, {p.nome.split(' ')[0]}! 👋</h1>
          <p>Continue aprendendo e evoluindo no seu ritmo!</p>
          <Link className="botao" href="/aluno/atividades">Explorar matérias ›</Link>
        </section>

        {/* Nível e XP. A barra mostra quanto falta para o próximo nível. */}
        <section className="cartao c4">
          <div className="linha">
            <div className="hex"><div><small>Nível</small><strong>{nivel}</strong></div></div>
            <div style={{ flex: 1 }}>
              <p><strong style={{ color: '#fff' }}>{noNivel}</strong> / {XP_POR_NIVEL} XP</p>
              <div className="barra"><i style={{ width: `${(noNivel / XP_POR_NIVEL) * 100}%` }} /></div>
            </div>
          </div>
          <p style={{ marginTop: '1rem' }}>🏆 Conquistas <span className="em-breve">em breve</span></p>
        </section>

        {/* Seu Progresso: rosca com o % geral e uma barra por matéria */}
        <section className="cartao c6">
          <h3>🏅 Seu progresso</h3>
          <div className="progresso">
            <div style={{ textAlign: 'center' }}>
              <svg className="rosca" viewBox="0 0 100 100" role="img" aria-label={`${geral}% das perguntas acertadas`}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="#253745" strokeWidth="9" />
                {/* 263.9 é o comprimento da circunferência; o traço verde cobre a parte que o aluno já fez. */}
                <circle cx="50" cy="50" r="42" fill="none" stroke="#3cf08d" strokeWidth="9" strokeLinecap="round"
                  strokeDasharray={`${geral * 2.639} 263.9`} transform="rotate(-90 50 50)" />
                <text x="50" y="56" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="800">{geral}%</text>
              </svg>
              <p>das perguntas acertadas</p>
            </div>
            <div className="lista-materias">
              {porMateria.length === 0 && <p>Responda sua primeira pergunta para ver o progresso por matéria.</p>}
              {porMateria.map((m) => (
                <div className="materia-linha" key={m.id}>
                  <span>{m.icone} {m.nome}</span><strong style={{ color: '#fff' }}>{m.pct}%</strong>
                  <div className="minibarra"><i style={{ width: `${m.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recursos que ainda serão construídos, sinalizados como "em breve" */}
        <section className="cartao c3">
          <div className="icone">👥</div><h3>Sala</h3>
          <p>Veja o desempenho da sua turma.</p><span className="em-breve">em breve</span>
        </section>
        <section className="cartao c3">
          <div className="icone">🏆</div><h3>Torneios</h3>
          <p>Desafie outros alunos e mostre seu talento.</p><span className="em-breve">em breve</span>
        </section>

        {/* Últimas perguntas acertadas */}
        <section className="cartao c7">
          <h3>🕒 Atividades recentes</h3>
          {(ganhos ?? []).length === 0 && <p>Responda uma pergunta para começar o seu histórico.</p>}
          {(ganhos ?? []).slice(0, 3).map((g, k) => (
            <div className="recente" key={k}>
              <span>✅ Acertou uma questão de {g.perguntas?.assuntos?.nome ?? 'uma atividade'}</span>
              <span className="xp-ganho">+{g.quantidade} XP</span>
              <span>{quando(g.criado_em)}</span>
            </div>
          ))}
        </section>

        {/* Banner que leva para as atividades */}
        <Link className="cartao banner c5" href="/aluno/atividades">
          <div><h3>Seu esforço te leva mais longe!</h3><p>Continue estudando para ganhar XP e subir de nível.</p></div>
          <div className="icone">🎮</div>
        </Link>
      </div>
    </Painel>
  )
}
