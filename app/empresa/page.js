// ÁREA: Área da empresa. Só quem tem o papel "empresa" entra aqui (o porteiro, middleware.js, garante isso).
import Painel from '../../components/Painel'

export default function Empresa() {
  return (
    <Painel titulo="Área da empresa">
      <div className="cartao"><p>A gestão de pontos e recompensas chega na etapa 5.</p></div>
    </Painel>
  )
}
