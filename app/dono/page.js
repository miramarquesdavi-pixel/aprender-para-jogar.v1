// ÁREA: Área do dono. Só quem tem o papel "dono" entra aqui (o porteiro, middleware.js, garante isso).
import Painel from '../../components/Painel'

export default function Dono() {
  return (
    <Painel titulo="Área do dono">
      <div className="cartao"><p>Os indicadores, relatórios e os pontos da empresa para eventos chegam na etapa 5.</p></div>
    </Painel>
  )
}
