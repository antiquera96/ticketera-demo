import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Wallet,
  Zap,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import PageHeader from '../../components/PageHeader'
import { formatCLP, formatFechaHora, formatFechaLarga } from '../../utils/format'

export default function Settlement() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, getEvento, getOrdenesByEvento, marcarLiquidacionPagada } =
    useStore()

  const evento = getEvento(id!)
  if (!evento) return null

  const ordenes = getOrdenesByEvento(evento.id).filter(
    (o) => o.estado === 'pagada',
  )
  const ingresoBruto = ordenes.reduce((a, o) => a + (o.total - o.cargoServicio), 0)
  const cargo = ordenes.reduce((a, o) => a + o.cargoServicio, 0)
  const total = ordenes.reduce((a, o) => a + o.total, 0)
  const neto = total - cargo

  const liq = state.liquidaciones.find((l) => l.eventoId === evento.id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <button
        onClick={() => navigate('/productor')}
        className="mb-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-electric-300"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al panel
      </button>

      <PageHeader
        eyebrow="Liquidación"
        title={`Resumen de liquidación · ${evento.nombre}`}
        subtitle="Lo que te transferimos a ti como productor, descontando el cargo por servicio."
        actions={
          <button onClick={() => window.print()} className="btn-ghost">
            <Download className="h-4 w-4" /> Imprimir / PDF
          </button>
        }
      />

      <div className="panel rounded-3xl p-6 sm:p-8 print:shadow-none">
        <div className="flex flex-col gap-4 border-b border-white/5 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-electric-300">
              Productora Demo
            </div>
            <div className="text-base font-semibold text-white">
              {evento.nombre}
            </div>
            <div className="text-xs text-slate-500">
              {formatFechaLarga(evento.fecha, evento.hora)} · {evento.lugar},{' '}
              {evento.ciudad}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
              N° entradas vendidas
            </div>
            <div className="text-2xl font-semibold text-white">
              {ordenes.reduce((a, o) => a + o.items.length, 0)}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2 text-sm">
          <Row label="Ingreso bruto (entradas)" value={formatCLP(ingresoBruto)} />
          <Row
            label={`Cargo por servicio (${evento.cargoServicioPct}%)`}
            value={'- ' + formatCLP(cargo)}
            tone="neg"
          />
          <div className="my-3 divider" />
          <Row label="Total cobrado al público" value={formatCLP(total)} />
          <div className="my-3 divider" />
          <div className="rounded-2xl border border-electric-400/30 bg-electric-400/10 p-4">
            <Row
              label="Neto a transferir al productor"
              value={formatCLP(neto)}
              strong
              tone="electric"
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-electric-200">
            <Zap className="h-4 w-4" /> Pago rápido
          </div>
          <div className="mt-1">
            Recibirás el monto neto en tu cuenta bancaria en{' '}
            <span className="text-white">1 a 2 días hábiles</span> posteriores
            al evento.
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {liq?.pagadaEn ? (
            <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              Pagado el {formatFechaHora(liq.pagadaEn)}
            </div>
          ) : (
            <button
              onClick={() => marcarLiquidacionPagada(evento.id)}
              className="btn-primary flex-1"
            >
              <Wallet className="h-4 w-4" /> Marcar como pagado al productor
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  strong,
  tone,
}: {
  label: string
  value: string
  strong?: boolean
  tone?: 'electric' | 'neg'
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? 'text-white' : 'text-slate-400'}>{label}</span>
      <span
        className={
          tone === 'electric'
            ? 'text-xl font-semibold text-electric-200'
            : tone === 'neg'
            ? 'font-medium text-rose-300'
            : strong
            ? 'text-base font-semibold text-electric-200'
            : 'font-medium text-white'
        }
      >
        {value}
      </span>
    </div>
  )
}
