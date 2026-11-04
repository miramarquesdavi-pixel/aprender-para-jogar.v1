// Layout raiz: envolve TODAS as páginas do site.
import './globals.css'

// Título e descrição que aparecem na aba do navegador e no Google.
export const metadata = {
  title: 'Aprender para Jogar',
  description: 'Aprender não precisa ser uma obrigação. Pode ser uma aventura.',
}

export default function Layout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
