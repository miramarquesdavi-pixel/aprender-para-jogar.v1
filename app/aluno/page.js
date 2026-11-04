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
      <div className="cartao">
        <p>Nível geral</p>
        <div className="nivel">{nivel}</div>
        {/* A largura da barra mostra quanto falta para o próximo nível. */}
        <div className="barra"><i style={{ width: `${(noNivel / XP_POR_NIVEL) * 100}%` }} /></div>
        <p>{p.xp} XP no total · faltam {XP_POR_NIVEL - noNivel} XP para o nível {nivel + 1}</p>
      </div>
      <div className="cartao">
        {/* Atalhos para as páginas do aluno */}
        <div className="coluna" style={{ marginTop: 0 }}>
          <Link className="botao" href="/aluno/atividades">Praticar atividades</Link>
          <Link className="botao sec" href="/aluno/ranking">Ver ranking</Link>
          <Link className="botao sec" href="/aluno/duvidas">Minhas dúvidas</Link>
          <Link className="botao sec" href="/aluno/professores">Meus professores</Link>
        </div>
      </div>
    </Painel>
  )
}
