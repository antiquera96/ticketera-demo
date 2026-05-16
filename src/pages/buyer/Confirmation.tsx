import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, Download, FileText, Receipt } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import TicketCard from '../../components/TicketCard'
import { formatCLP, formatFechaHora } from '../../utils/format'

export default function Confirmation() {
  const { ordenId } = useParams()
  const navigate = useNavigate()
  const { state, getEntradasByOrden, getBoletaByOrden, getEvento } = useStore()
  const orden = state.ordenes.find((o) => o.id === ordenId)
  if (!orden) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center text-slate-400">
        Orden no encontrada.{' '}
        <button onClick={() => navigate('/')} className="text-electric-300">
          Volver
        </button>
      </div>
    )
  }
  const evento = getEvento(orden.eventoId)!
  const entradas = getEntradasByOrden(orden.id)
  const boleta = getBoletaByOrden(orden.id)

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <div className="my-6 panel rounded-3xl p-6 text-center sm:p-8">
        <div className="relative inline-flex">
          <div className="absolute inset-0 -z-10 rounded-full bg-emerald-400/30 blur-xl" />
          <div className="rounded-full bg-emerald-400/15 p-3 text-emerald-300">
            <CheckCircle2 className="h-8 w-8" />
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
          ¡Pago confirmado!
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Te enviamos un correo a{' '}
          <span className="text-electric-200">{orden.compradorEmail}</span> con
          tus entradas. <em className="text-slate-500">(Simulado)</em>
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Link
          to="/mis-entradas"
          className="panel panel-hover flex items-center justify-between rounded-2xl px-5 py-4 text-sm"
        >
          <div>
            <div className="text-[10px] uppercase tracking-wider text-electric-300">
              Mis entradas
            </div>
            <div className="mt-0.5 font-medium text-white">
              Ver todas las entradas compradas
            </div>
          </div>
          <Download className="h-4 w-4 text-slate-400" />
        </Link>
        <button
          onClick={() => window.print()}
          className="panel panel-hover flex items-center justify-between rounded-2xl px-5 py-4 text-left text-sm"
        >
          <div>
            <div className="text-[10px] uppercase tracking-wider text-electric-300">
              Boleta SII
            </div>
            <div className="mt-0.5 font-medium text-white">
              Imprimir o guardar PDF
            </div>
          </div>
          <FileText className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      <div className="space-y-4">
        {entradas.map((e) => (
          <TicketCard key={e.id} entrada={e} evento={evento} />
        ))}
      </div>

      {/* Boleta simulada */}
      {boleta && (
        <div className="panel mt-6 rounded-3xl p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-electric-400/15 p-2 text-electric-200">
                <Receipt className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Boleta electrónica
                </div>
                <div className="text-[11px] text-slate-500">
                  Documento simulado · sin valor tributario real
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                N°
              </div>
              <div className="font-mono text-base text-electric-200">
                {boleta.numero}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                Fecha
              </div>
              <div className="text-slate-200">
                {formatFechaHora(boleta.fecha)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                Cliente
              </div>
              <div className="text-slate-200">{orden.compradorNombre}</div>
            </div>
            <div className="col-span-2">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                Detalle
              </div>
              <div className="text-slate-200">
                {orden.items.length} entrada{orden.items.length === 1 ? '' : 's'}{' '}
                · {evento.nombre}
              </div>
            </div>
            <div className="col-span-2 mt-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Row label="Subtotal" value={formatCLP(orden.subtotal)} />
              {orden.descuento > 0 && (
                <Row
                  label="Descuento"
                  value={'- ' + formatCLP(orden.descuento)}
                />
              )}
              <Row
                label="Cargo por servicio"
                value={formatCLP(orden.cargoServicio)}
              />
              <div className="my-2 divider" />
              <Row label="Total" value={formatCLP(orden.total)} strong />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className={strong ? 'text-white' : 'text-slate-400'}>{label}</span>
      <span
        className={
          strong
            ? 'text-base font-semibold text-electric-200'
            : 'font-medium text-white'
        }
      >
        {value}
      </span>
    </div>
  )
}
