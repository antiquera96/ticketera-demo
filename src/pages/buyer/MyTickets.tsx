import { Link } from 'react-router-dom'
import { Ticket } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import PageHeader from '../../components/PageHeader'
import TicketCard from '../../components/TicketCard'

export default function MyTickets() {
  const { state, getEvento } = useStore()
  // En la demo mostramos TODAS las entradas (es la "bandeja" del comprador genérico)
  const entradas = [...state.entradas].sort((a, b) => {
    if (a.estado === b.estado) return 0
    if (a.estado === 'valida') return -1
    return 1
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Bandeja del comprador"
        title="Mis entradas"
        subtitle="Estas son tus entradas válidas, cortesías y entradas ya utilizadas. Llévalas en tu móvil o imprímelas."
      />

      {entradas.length === 0 ? (
        <div className="panel rounded-2xl p-12 text-center">
          <Ticket className="mx-auto h-8 w-8 text-slate-500" />
          <p className="mt-3 text-slate-400">
            Aún no compraste entradas en esta sesión.
          </p>
          <Link to="/" className="btn-primary mt-4">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {entradas.map((e) => {
            const evento = getEvento(e.eventoId)
            if (!evento) return null
            return <TicketCard key={e.id} entrada={e} evento={evento} />
          })}
        </div>
      )}
    </div>
  )
}
