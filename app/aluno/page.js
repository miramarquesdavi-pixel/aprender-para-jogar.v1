// ÁREA DO ALUNO (só quem tem papel "aluno" entra aqui; o porteiro garante isso).
import Link from 'next/link'
import Painel from '../../components/Painel'
import { pegarPerfil } from '../../lib/perfil'

// REGRA DE NÍVEL: a cada 100 XP o aluno sobe um nível. Mude o número abaixo para ajustar.
const XP_POR_NIVEL = 100

export default async function Aluno() {
  const p = await pegarPerfil()
  const nivel = Math.floor(p.xp / XP_POR_NIVEL) + 1
  const noNivel = p.xp % XP_POR_NIVEL // XP já ganho dentro do nível atual

  return (
    <Painel titulo="Meu painel">
      <section className="bento">
        {/* Cartão grande: nível e barra de progresso. A largura da barra mostra quanto falta para o próximo nível. */}
        <div className="cartao grande">
          <p className="marker">Seu nível</p>
          <div className="nivel">{nivel}</div>
          <div className="barra"><i style={{ width: `${(noNivel / XP_POR_NIVEL) * 100}%` }} /></div>
          <p>{p.xp} XP no total · faltam {XP_POR_NIVEL - noNivel} XP para o nível {nivel + 1}</p>
        </div>
        {/* Atalhos para as páginas do aluno */}
        <Link className="cartao atalho" href="/aluno/atividades"><div className="icone">🎮</div><h3>Praticar atividades</h3><p>Escolha uma matéria e ganhe XP.</p></Link>
        <Link className="cartao atalho" href="/aluno/ranking"><div className="icone">🏆</div><h3>Ranking</h3><p>Veja quem está no topo.</p></Link>
        <Link className="cartao atalho" href="/aluno/duvidas"><div className="icone">💬</div><h3>Minhas dúvidas</h3><p>Pergunte aos professores.</p></Link>
        <Link className="cartao atalho" href="/aluno/professores"><div className="icone">👩‍🏫</div><h3>Meus professores</h3><p>Aceite pedidos e veja quem acompanha você.</p></Link>
      </section>
    </Painel>
  )
}
