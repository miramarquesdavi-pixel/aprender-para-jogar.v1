'use client'
// Página aberta pelo link do e-mail de "Esqueci minha senha": a pessoa define a nova senha.
import { useState } from 'react'
import { criarClienteNavegador } from '../../lib/supabase/client'

export default function RedefinirSenha() {
  const [aviso, setAviso] = useState('')

  async function salvar(e) {
    e.preventDefault()
    const senha = new FormData(e.target).get('senha')
    const { error } = await criarClienteNavegador().auth.updateUser({ password: senha })
    if (error) return setAviso(error.message)
    window.location.href = '/' // senha trocada: segue para a área da pessoa
  }

  return (
    <main className="pagina" style={{ maxWidth: 460 }}>
      <h1>Nova senha</h1>
      <form onSubmit={salvar} className="coluna">
        <input name="senha" type="password" placeholder="Nova senha (mínimo 6 caracteres)" minLength={6} required />
        <button type="submit">Salvar nova senha</button>
      </form>
      <p className="aviso" role="status">{aviso}</p>
    </main>
  )
}
