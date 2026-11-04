'use client'
// Formulário do professor para responder uma dúvida (o XP é dado pelo banco, na primeira resposta).
import { useRouter } from 'next/navigation'
import { criarClienteNavegador } from '../lib/supabase/client'

export default function ResponderDuvida({ id }) {
  const router = useRouter()
  async function enviar(e) {
    e.preventDefault()
    await criarClienteNavegador().rpc('responder_duvida', { p_duvida: id, p_resposta: new FormData(e.target).get('resposta') })
    router.refresh()
  }
  return (
    <form onSubmit={enviar} className="coluna">
      <textarea name="resposta" placeholder="Escreva a resposta" maxLength={2000} required />
      <button type="submit">Responder</button>
    </form>
  )
}
