'use client'
// Menu do topo. É um componente de navegador porque precisa saber em qual página a pessoa está.
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav({ itens }) {
  const atual = usePathname()
  // Um link fica "aceso" na página dele. O Início (ex.: /aluno) só acende em correspondência exata;
  // os demais acendem também nas páginas internas (ex.: /aluno/atividades/mat-adicao).
  const ativo = (href) => atual === href || (href.split('/').length > 2 && atual.startsWith(href))
  return (
    <nav className="nav" aria-label="Principal">
      {itens.map(([href, nome]) => (
        <Link key={href} href={href} className={ativo(href) ? 'ativo' : ''}>{nome}</Link>
      ))}
    </nav>
  )
}
