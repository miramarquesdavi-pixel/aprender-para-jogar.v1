// Layout raiz: envolve TODAS as páginas do site e carrega as fontes.
import './globals.css'

// Título e descrição que aparecem na aba do navegador e no Google.
export const metadata = {
  title: 'Aprender para Jogar',
  description: 'Aprender não precisa ser uma obrigação. Pode ser uma aventura.',
}

export default function Layout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Fontes do Google: Bricolage (títulos), DM Sans (texto) e Permanent Marker (rabiscos). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=DM+Sans:wght@400;500;700&family=Permanent+Marker&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
