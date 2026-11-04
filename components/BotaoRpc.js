'use client'
// Botão genérico: chama uma função do banco (fn) com os argumentos (args) e recarrega a página.
import { useRouter } from 'next/navigation'
import { criarClienteNavegador } from '../lib/supabase/client'

export default function BotaoRpc({ fn, args, rotulo, sec }) {
  const router = useRouter()
  async function clicar() {
    await criarClienteNavegador().rpc(fn, args)
    router.refresh() // atualiza a lista na tela
  }
  return <button className={sec ? 'sec' : ''} onClick={clicar}>{rotulo}</button>
}
