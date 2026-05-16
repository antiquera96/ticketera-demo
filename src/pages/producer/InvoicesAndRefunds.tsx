import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertOctagon,
  ArrowLeft,
  Ban,
  CheckCircle2,
  Receipt,
  RotateCcw,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import PageHeader from '../../components/PageHeader'
import Modal from '../../components/Modal'
import { formatCLP, formatFechaHora } from '../../utils/format'

export default function InvoicesAndRefunds() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    state,
    getEvento,
    getOrdenesByEvento,
    cancelarEvento,
    reembolsarOrden,
  } = useStore()

  const evento = getEvento(id!)
  if (!evento) return null

  const ordenes = [...getOrdenesByEvento(evento.id)].sort(
    (a, b) => b.fecha.localeCompare(a.fecha),
  )
  const boletas = state.boletas
    .filter((b) => ordenes.find((o) => o.id === b.ordenId))
    .sort((a, b) => b.numero - a.numero)
  const devoluciones = state.devoluciones.filter((d) =>
    ordenes.find((o) => o.id === d.ordenId),
  )

  const [openCancel, setOpenCancel] = useState(false)
  const [motivoCancel, setMotivoCancel] = useState('Cancelación del evento')
  const [refundOrdenId, setRefundOrdenId] = useState<string | null>(null)
  const [motivoRefund, setMotivoRefund] = useState(
    'Solicitud del comprador',
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <button
        onClick={() => navigate('/productor')}
        className="mb-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-electric-300"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al panel
      </button>

      <PageHeader
        eyebrow="Boletas & devoluciones"
        title={evento.nombre}
        subtitle="Boletas electrónicas emitidas y gestión de devoluciones."
        actions={
          evento.estado !== 'cancelado' ? (
            <button
              onClick={() => setOpenCancel(true)}
              className="btn-danger"
            >
              <Ban className="h-4 w-4" /> Cancelar evento
            </button>
          ) : (
            <span className="chip-danger">Evento cancelado</span>
          )
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <section className="panel rounded-3xl">
          <div className="flex items-center justify-between border-b border-white/5 p-5">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-electric-400/15 p-2 text-electric-200">
                <Receipt className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Boletas emitidas
                </div>
                <div className="text-xs text-slate-500">
                  {boletas.length} documentos
                </div>
              </div>
            </div>
          </div>
          <div className="max-h-[500px] overflow-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-3 py-3 sm:px-5">N°</th>
                  <th className="px-3 py-3 sm:px-5">Cliente</th>
                  <th className="px-3 py-3 text-right sm:px-5">Monto</th>
                </tr>
              </thead>
              <tbody>
                {boletas.map((b) => {
                  const orden = ordenes.find((o) => o.id === b.ordenId)
                  return (
                    <tr key={b.numero} className="border-t border-white/5">
                      <td className="px-3 py-3 font-mono text-electric-200 sm:px-5">
                        {b.numero}
                      </td>
                      <td className="px-3 py-3 text-slate-300 sm:px-5">
                        {orden?.compradorNombre ?? '—'}
                        <div className="text-[10px] text-slate-500">
                          {formatFechaHora(b.fecha)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right font-medium text-white sm:px-5">
                        {formatCLP(b.monto)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel rounded-3xl">
          <div className="flex items-center justify-between border-b border-white/5 p-5">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-rose-400/15 p-2 text-rose-200">
                <RotateCcw className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Devoluciones
                </div>
                <div className="text-xs text-slate-500">
                  {devoluciones.length} procesadas
                </div>
              </div>
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
            {devoluciones.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                No hay devoluciones procesadas.
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {devoluciones.map((d) => {
                  const orden = ordenes.find((o) => o.id === d.ordenId)
                  return (
                    <li key={d.id} className="px-5 py-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white">
                            {orden?.compradorNombre ?? d.ordenId}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {formatFechaHora(d.fecha)} · {d.motivo}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-rose-300">
                            - {formatCLP(d.monto)}
                          </div>
                          <span className="chip-success mt-1">
                            <CheckCircle2 className="h-3 w-3" /> Reembolsado
                          </span>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      <section className="panel mt-6 rounded-3xl">
        <div className="border-b border-white/5 p-5">
          <div className="text-sm font-semibold text-white">
            Órdenes del evento
          </div>
          <div className="text-xs text-slate-500">
            Procesa devoluciones puntuales aquí.
          </div>
        </div>
        <div className="max-h-[500px] overflow-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="whitespace-nowrap px-3 py-3 sm:px-5">Cliente</th>
                <th className="whitespace-nowrap px-3 py-3 sm:px-5">Fecha</th>
                <th className="whitespace-nowrap px-3 py-3 sm:px-5">Entradas</th>
                <th className="whitespace-nowrap px-3 py-3 text-right sm:px-5">Total</th>
                <th className="whitespace-nowrap px-3 py-3 text-right sm:px-5">Estado</th>
                <th className="whitespace-nowrap px-3 py-3 text-right sm:px-5">Acción</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => (
                <tr key={o.id} className="border-t border-white/5">
                  <td className="whitespace-nowrap px-3 py-3 text-white sm:px-5">
                    {o.compradorNombre}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-300 sm:px-5">
                    {formatFechaHora(o.fecha)}
                  </td>
                  <td className="px-3 py-3 text-slate-300 sm:px-5">{o.items.length}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right font-medium text-white sm:px-5">
                    {formatCLP(o.total)}
                  </td>
                  <td className="px-3 py-3 text-right sm:px-5">
                    {o.estado === 'pagada' && (
                      <span className="chip-success">Pagada</span>
                    )}
                    {o.estado === 'reembolsada' && (
                      <span className="chip-danger">Reembolsada</span>
                    )}
                    {o.estado === 'rechazada' && (
                      <span className="chip-warn">Rechazada</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right sm:px-5">
                    {o.estado === 'pagada' && (
                      <button
                        onClick={() => setRefundOrdenId(o.id)}
                        className="text-xs text-electric-300 hover:underline"
                      >
                        Reembolsar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={openCancel}
        onClose={() => setOpenCancel(false)}
        title="Cancelar evento"
        size="sm"
      >
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
            <AlertOctagon className="h-4 w-4 flex-none" />
            Esto reembolsará automáticamente todas las órdenes pagadas y
            anulará sus entradas.
          </div>
          <div>
            <label className="label">Motivo</label>
            <input
              value={motivoCancel}
              onChange={(e) => setMotivoCancel(e.target.value)}
              className="input"
            />
          </div>
          <button
            onClick={() => {
              cancelarEvento(evento.id, motivoCancel)
              setOpenCancel(false)
            }}
            className="btn-danger w-full"
          >
            Confirmar cancelación
          </button>
        </div>
      </Modal>

      <Modal
        open={!!refundOrdenId}
        onClose={() => setRefundOrdenId(null)}
        title="Reembolsar orden"
        size="sm"
      >
        <div className="space-y-3">
          <div>
            <label className="label">Motivo</label>
            <input
              value={motivoRefund}
              onChange={(e) => setMotivoRefund(e.target.value)}
              className="input"
            />
          </div>
          <button
            onClick={() => {
              if (refundOrdenId) {
                reembolsarOrden(refundOrdenId, motivoRefund)
                setRefundOrdenId(null)
              }
            }}
            className="btn-danger w-full"
          >
            Procesar reembolso
          </button>
        </div>
      </Modal>
    </div>
  )
}
