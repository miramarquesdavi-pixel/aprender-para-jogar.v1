// Configuração do Next.js.
module.exports = {
  experimental: {
    // Não guarda páginas em cache no navegador: assim o XP e o ranking aparecem atualizados ao voltar ao painel.
    staleTimes: { dynamic: 0 },
  },
}
