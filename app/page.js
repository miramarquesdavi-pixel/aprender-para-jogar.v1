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
    <main className="pagina" style={{ maxWidth: 460 }}>
      <h1>Aprender para Jogar</h1>
      <p>Aprender não precisa ser uma obrigação. Pode ser uma aventura.</p>

      <div className="cartao">
        <div className="coluna" style={{ marginTop: 0 }}>
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
    </main>
  )
}
