'use client'
// PÁGINA DE ENTRADA: login com Google, Microsoft ou e-mail/senha, cadastro e recuperação de senha.
import { useRef, useState } from 'react'
import { criarClienteNavegador } from '../lib/supabase/client'

export default function Entrada() {
  const [modo, setModo] = useState('entrar') // 'entrar' ou 'criar' (alterna o formulário)
  const [aviso, setAviso] = useState('')     // mensagem mostrada embaixo do formulário
  const form = useRef(null)
  const supabase = criarClienteNavegador()

  // Para onde o Supabase devolve a pessoa depois de confirmar o login/e-mail.
  const voltar = () => `${window.location.origin}/auth/callback`

  // Login com Google ('google') ou Microsoft ('azure'): abre a tela do provedor.
  async function social(provedor) {
    await supabase.auth.signInWithOAuth({
      provider: provedor,
      options: { redirectTo: voltar(), scopes: provedor === 'azure' ? 'email' : undefined },
    })
  }

  // Envia o formulário: faz login ou cria a conta, conforme o modo.
  async function enviar(e) {
    e.preventDefault()
    const f = new FormData(form.current)
    const email = f.get('email')
    const senha = f.get('senha')

    if (modo === 'entrar') {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) return setAviso('E-mail ou senha incorretos.')
      window.location.href = '/' // o porteiro (middleware.js) leva para a área certa
      return
    }

    // Cadastro: confere o formato do @usuario antes de enviar.
    const usuario = String(f.get('usuario')).trim().toLowerCase().replace(/^@/, '')
    if (!/^[a-z0-9_]{3,20}$/.test(usuario))
      return setAviso('O @usuario deve ter de 3 a 20 letras minúsculas, números ou _.')
    const { error } = await supabase.auth.signUp({
      email, password: senha,
      // "data" é lido pelo banco para criar o perfil (veja schema.sql).
      options: { emailRedirectTo: voltar(), data: { nome: f.get('nome'), usuario } },
    })
    // Se o @usuario já existe, o banco recusa e o Supabase devolve um erro genérico de banco.
    if (error) return setAviso(error.message.includes('Database') ? 'Esse @usuario já está em uso.' : error.message)
    setAviso('Conta criada! Abra o link que enviamos para o seu e-mail para confirmar.')
  }

  // Envia o e-mail de recuperação de senha para o endereço digitado.
  async function recuperar() {
    const email = new FormData(form.current).get('email')
    if (!email) return setAviso('Digite seu e-mail no campo acima.')
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha` })
    setAviso('Se esse e-mail tiver conta, enviamos um link para criar uma nova senha.')
  }

  return (
    <main className="pagina">
      {/* Barra do topo com a marca */}
      <header className="barra-topo">
        <span className="marca"><b>APJ</b>Aprender para Jogar</span>
        <span className="marker">pronto para o nível 1?</span>
      </header>

      <section className="hero">
        {/* Lado esquerdo: mensagem principal. Edite os textos aqui. */}
        <div>
          <p className="marker" style={{ fontSize: '1.5rem' }}>Bem-vindo(a), jogador(a)!</p>
          <h1>Aprender não precisa ser <span className="sublinhado">obrigação.</span> Pode ser <span className="verde">aventura.</span></h1>
          <p style={{ margin: '1.1rem 0 1.5rem', maxWidth: '48ch' }}>Estude no seu ritmo, ganhe XP a cada acerto, suba de nível e dispute o ranking com os colegas.</p>
          <div className="notas"><span className="nota">+XP a cada acerto!</span><span className="nota verde">escolha qualquer assunto</span></div>
        </div>

        {/* Lado direito: login, cadastro e recuperação de senha */}
        <div className="cartao" style={{ marginTop: 0 }}>
          <h2 style={{ fontSize: '1.6rem' }}>{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</h2>
          <div className="coluna">
            <button className="sec" onClick={() => social('google')}>Entrar com Google</button>
            <button className="sec" onClick={() => social('azure')}>Entrar com Microsoft</button>
          </div>
          <form ref={form} onSubmit={enviar} className="coluna">
            {/* Campos extras que só aparecem no cadastro */}
            {modo === 'criar' && <>
              <input name="nome" placeholder="Seu nome" required />
              <input name="usuario" placeholder="@usuario (como os professores vão te achar)" required />
            </>}
            <input name="email" type="email" placeholder="E-mail" required />
            <input name="senha" type="password" placeholder="Senha (mínimo 6 caracteres)" minLength={6} required />
            <button type="submit">{modo === 'entrar' ? 'Entrar' : 'Criar conta'}</button>
          </form>
          <div className="coluna">
            <button className="sec" onClick={() => { setModo(modo === 'entrar' ? 'criar' : 'entrar'); setAviso('') }}>
              {modo === 'entrar' ? 'Não tenho conta' : 'Já tenho conta'}
            </button>
            {modo === 'entrar' && <button className="sec" onClick={recuperar}>Esqueci minha senha</button>}
          </div>
          <p className="aviso" role="status">{aviso}</p>
        </div>
      </section>

      {/* Cartões de apresentação */}
      <section className="bento">
        <div className="cartao"><div className="icone">🎮</div><h3>Jogue e aprenda</h3><p>Desafios por matéria, com correção na hora e explicação de cada resposta.</p></div>
        <div className="cartao"><div className="icone">⭐</div><h3>Ganhe XP</h3><p>Cada acerto vale pontos. Quanto mais difícil, mais XP.</p></div>
        <div className="cartao"><div className="icone">🏆</div><h3>Ranking saudável</h3><p>Compare sua evolução sem constrangimento: só o topo aparece.</p></div>
        <div className="cartao"><div className="icone">👩‍🏫</div><h3>Fale com professores</h3><p>Envie dúvidas e receba respostas direto na plataforma.</p></div>
      </section>
    </main>
  )
}
