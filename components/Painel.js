// Moldura comum a todas as áreas: barra do topo (logo, menu, XP, sino, avatar, sair) e título da página.
import Link from 'next/link'
import Nav from './Nav'
import { pegarPerfil } from '../lib/perfil'
import { criarClienteServidor } from '../lib/supabase/server'

// MENU de cada tipo de acesso: [endereço, nome]. Para ligar uma página nova (ex.: Biblioteca), acrescente uma linha.
const MENU = {
  aluno: [['/aluno', 'Início'], ['/aluno/atividades', 'Matérias'], ['/aluno/ranking', 'Ranking'], ['/aluno/duvidas', 'Dúvidas'], ['/aluno/professores', 'Professores']],
  professor: [['/professor', 'Alunos'], ['/professor/duvidas', 'Dúvidas']],
}

// Ícone de controle de videogame (logo provisório; troque pela sua logo quando quiser).
const Logo = () => (
  <svg className="logo" viewBox="0 0 48 32" aria-hidden="true">
    <rect x="2" y="4" width="44" height="26" rx="13" fill="#3cf08d" />
    <path d="M14 12v8M10 16h8" stroke="#052414" strokeWidth="3" strokeLinecap="round" />
    <circle cx="33" cy="14" r="2.5" fill="#052414" /><circle cx="38" cy="19" r="2.5" fill="#052414" />
  </svg>
)

export default async function Painel({ titulo, semTitulo, cheia, children }) {
  const p = await pegarPerfil()
  // Conta as notificações ainda não lidas (o banco só entrega as da própria pessoa).
  const { count } = await criarClienteServidor()
    .from('notificacoes').select('id', { count: 'exact', head: true }).eq('lida', false)
  return (
    <main className={'pagina' + (cheia ? ' cheia' : '')}>
      <header className="barra-topo">
        <Link className="marca" href="/"><Logo />Aprender para Jogar</Link>
        <Nav itens={MENU[p.papel] ?? []} />
        <div className="direita">
          {/* XP e nível. Atualiza na hora quando o aluno responde (o Quiz chama router.refresh).
              Mantenha o 100 igual ao XP_POR_NIVEL de app/aluno/page.js. */}
          {(p.papel === 'aluno' || p.papel === 'professor') && (
            <span className="xp-pill" aria-live="polite">⭐ {p.xp} XP · Nível {Math.floor(p.xp / 100) + 1}</span>
          )}
          <Link className="botao sec" href="/notificacoes">🔔 {count ?? 0}</Link>
          <span className="avatar" title={p.nome}>{p.nome?.[0]?.toUpperCase()}</span>
          {/* O botão envia um POST para /auth/sair, que encerra a sessão. */}
          <form action="/auth/sair" method="post"><button className="sec">Sair</button></form>
        </div>
      </header>
      {/* cheia: faz a página caber inteira na janela, sem rolagem (veja globals.css). semTitulo: a página do aluno tem a própria saudação, então não repete o título. */}
      {!semTitulo && (
        <div style={{ padding: '1rem 0 0' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.3rem)' }}>{titulo}</h1>
          <p>{p.nome} · @{p.usuario}</p>
        </div>
      )}
      {children}
    </main>
  )
}
