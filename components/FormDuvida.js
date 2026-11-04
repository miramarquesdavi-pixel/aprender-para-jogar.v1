'use client'
// Formulário do aluno para enviar uma dúvida a um dos seus professores.
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarClienteNavegador } from '../lib/supabase/client'

export default function FormDuvida({ professores }) {
  const [aviso, setAviso] = useState('')
  const router = useRouter()

  async function enviar(e) {
    e.preventDefault()
    const form = e.target
    const d = new FormData(form)
    // O banco confere se o professor tem vínculo aceito com este aluno.
    const { error } = await criarClienteNavegador().rpc('enviar_duvida',
      { p_professor: d.get('professor'), p_titulo: d.get('titulo'), p_texto: d.get('texto') })
    setAviso(error ? 'Não foi possível enviar. Confira o professor e o tamanho do texto.' : 'Dúvida enviada!')
    if (!error) { form.reset(); router.refresh() }
  }

  return (
    <form onSubmit={enviar} className="coluna">
      <select name="professor" required>
        {professores.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
      </select>
      <input name="titulo" placeholder="Assunto da dúvida" maxLength={120} required />
      <textarea name="texto" placeholder="Escreva sua dúvida" maxLength={2000} required />
      <button type="submit">Enviar dúvida</button>
      <p className="aviso" role="status">{aviso}</p>
    </form>
  )
}
