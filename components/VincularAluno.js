'use client'
// Formulário do professor para adicionar um aluno pelo @usuario.
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarClienteNavegador } from '../lib/supabase/client'

export default function VincularAluno() {
  const [aviso, setAviso] = useState('')
  const router = useRouter()

  async function enviar(e) {
    e.preventDefault()
    const form = e.target
    const usuario = new FormData(form).get('usuario')
    // A função do banco confere se quem pede é professor e se o aluno existe.
    const { error } = await criarClienteNavegador().rpc('vincular_aluno', { p_usuario: usuario })
    if (error) return setAviso('Não encontrei um aluno com esse @usuario.')
    setAviso('Pedido enviado! O aluno precisa aceitar para você ver o progresso dele.'); form.reset()
    router.refresh() // recarrega a lista de alunos na tela
  }

  return (
    <form onSubmit={enviar} className="coluna">
      <input name="usuario" placeholder="@usuario do aluno" required />
      <button type="submit">Adicionar aluno</button>
      <p className="aviso" role="status">{aviso}</p>
    </form>
  )
}
