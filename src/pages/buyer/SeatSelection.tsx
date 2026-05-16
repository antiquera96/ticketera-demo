import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import SeatMap from '../../components/SeatMap'
import { formatCLP } from '../../utils/format'

export default function SeatSelection() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getEvento,
    getSectoresByEvento,
    state,
  } = useStore()
  const [selected, setSelected] = useState<string[]>([])

  const evento = getEvento(id!)
  const sectores = useMemo(
    () => (evento ? getSectoresByEvento(evento.id) : []),
    [evento, getSectoresByEvento],
  )
  const asientos = useMemo(() => {
    const ids = new Set(sectores.map((s) => s.id))
    return state.asientos.filter((a) => ids.has(a.sectorId))
  }, [sectores, state.asientos])

  useEffect(() => {
    // limpiar selección al cambiar evento
    setSelected([])
  }, [id])

  if (!evento) return null

  const items = selected.map((sid) => {
    const a = asientos.find((x) => x.id === sid)!
    const sector = sectores.find((s) => s.id === a.sectorId)!
    return {
      id: sid,
      label: `${sector.nombre} · Fila ${a.fila} · Asiento ${a.numero}`,
      precio: sector.precio,
    }
  })

  const subtotal = items.reduce((acc, i) => acc + i.precio, 0)
  const cargo = Math.round((subtotal * evento.cargoServicioPct) / 100)
  const total = subtotal + cargo

  function continuar() {
    if (!selected.length) return
    sessionStorage.setItem(
      'checkout_items',
      JSON.stringify({
        eventoId: evento.id,
        modo: 'butacas',
        asientoIds: selected,
      }),
    )
    navigate(`/checkout/${evento.id}`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <button
        onClick={() => navigate(-1)}
        className="my-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-electric-300"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <div className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
        <div className="panel rounded-3xl p-5 sm:p-8">
          <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-electric-300">
            {evento.lugar} · {evento.ciudad}
          </div>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            Elige tus butacas
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {evento.nombre}
          </p>

          <div className="mt-6">
            <SeatMap
              sectores={sectores}
              asientos={asientos}
              selectedIds={selected}
              onToggle={(id, a) => {
                if (a.estado === 'vendido' || a.estado === 'bloqueado') return
                setSelected((s) =>
                  s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
                )
              }}
            />
          </div>
        </div>

        <aside>
          <div className="panel rounded-3xl p-5 sm:p-6 md:sticky md:top-20">
            <h3 className="text-base font-semibold text-white">
              Resumen de selección
            </h3>
            {items.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center text-sm text-slate-400">
                Aún no eliges asientos.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {items.map((i) => (
                  <li
                    key={i.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
                  >
                    <div>
                      <div className="text-slate-200">{i.label}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-electric-200">
                        {formatCLP(i.precio)}
                      </div>
                      <button
                        onClick={() =>
                          setSelected((s) => s.filter((x) => x !== i.id))
                        }
                        className="text-[10px] text-slate-500 hover:text-rose-300"
                      >
                        Quitar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="my-4 divider" />
            <div className="space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatCLP(subtotal)} />
              <Row
                label={`Cargo por servicio (${evento.cargoServicioPct}%)`}
                value={formatCLP(cargo)}
              />
              <div className="my-2 divider" />
              <Row label="Total" value={formatCLP(total)} strong />
            </div>

            <button
              onClick={continuar}
              disabled={!selected.length}
              className="btn-primary mt-5 w-full"
            >
              Reservar y pagar · {selected.length} asiento
              {selected.length === 1 ? '' : 's'}
            </button>

            <div className="mt-3 flex items-start gap-2 rounded-xl border border-electric-400/20 bg-electric-400/[0.06] p-3 text-[11px] text-electric-200">
              <Info className="mt-0.5 h-3.5 w-3.5 flex-none" />
              Al confirmar, tus asientos quedan reservados por 10 minutos. Si el
              pago no se completa, vuelven a estar disponibles.
            </div>
          </div>
        </aside>
      </div>
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
    <div className="flex items-center justify-between">
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
