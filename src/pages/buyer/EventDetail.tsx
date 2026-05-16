import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MapPin,
  Minus,
  Plus,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { formatCLP, formatFechaLarga } from '../../utils/format'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getEvento, getTiposEntradaByEvento, getSectoresByEvento } = useStore()
  const evento = getEvento(id!)
  const [carrito, setCarrito] = useState<Record<string, number>>({})

  if (!evento) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-slate-400">
        Evento no encontrado.{' '}
        <button onClick={() => navigate('/')} className="text-electric-300">
          Volver al catálogo
        </button>
      </div>
    )
  }

  const tipos = getTiposEntradaByEvento(evento.id)
  const sectores = getSectoresByEvento(evento.id)
  const isButacas = evento.modo === 'butacas'

  const subtotal = useMemo(
    () =>
      Object.entries(carrito).reduce((acc, [tipoId, cant]) => {
        const t = tipos.find((x) => x.id === tipoId)
        return acc + (t ? t.precio * cant : 0)
      }, 0),
    [carrito, tipos],
  )

  const cargo = Math.round((subtotal * evento.cargoServicioPct) / 100)
  const total = subtotal + cargo
  const cantidad = Object.values(carrito).reduce((a, b) => a + b, 0)

  function setCant(tipoId: string, cant: number) {
    const t = tipos.find((x) => x.id === tipoId)
    if (!t) return
    const max = Math.max(0, t.cupo - t.vendidas)
    const next = Math.max(0, Math.min(max, cant))
    setCarrito((c) => ({ ...c, [tipoId]: next }))
  }

  function continuar() {
    if (isButacas) {
      navigate(`/eventos/${evento.id}/butacas`)
    } else {
      const items = Object.entries(carrito)
        .filter(([, c]) => c > 0)
        .map(([tipoEntradaId, cantidad]) => ({ tipoEntradaId, cantidad }))
      if (!items.length) return
      sessionStorage.setItem(
        'checkout_items',
        JSON.stringify({ eventoId: evento.id, modo: 'general', items }),
      )
      navigate(`/checkout/${evento.id}`)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <button
        onClick={() => navigate(-1)}
        className="my-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-electric-300"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="panel relative overflow-hidden rounded-3xl">
            <img
              src={evento.imagen}
              alt={evento.nombre}
              className="h-60 w-full object-cover sm:h-96"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
              {evento.modo === 'butacas' && (
                <span className="chip-electric mb-3">Butacas numeradas</span>
              )}
              <h1 className="text-2xl font-semibold leading-tight text-white sm:text-4xl text-balance">
                {evento.nombre}
              </h1>
              <div className="mt-3 flex flex-col gap-1.5 text-sm text-slate-300 sm:flex-row sm:flex-wrap sm:gap-4">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-electric-300 flex-none" />
                  {formatFechaLarga(evento.fecha, evento.hora)}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-electric-300 flex-none" />
                  {evento.lugar}, {evento.ciudad}
                </div>
              </div>
            </div>
          </div>

          <div className="panel mt-6 rounded-3xl p-6 sm:p-7">
            <h2 className="text-lg font-semibold text-white">
              Sobre el evento
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {evento.descripcion}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Feature label="Acceso con QR" />
              <Feature label="Boleta SII" />
              <Feature label="Soporte 24/7" />
            </div>
          </div>
        </div>

        {/* SELECTOR */}
        <aside>
          <div className="panel rounded-3xl p-5 sm:p-6 md:sticky md:top-20">
            <h3 className="text-base font-semibold text-white">
              Selecciona tus entradas
            </h3>
            {isButacas ? (
              <>
                <p className="mt-2 text-sm text-slate-400">
                  Este evento usa <span className="text-electric-200">mapa de butacas</span>.
                  Vas a elegir tus asientos en el mapa.
                </p>
                <button onClick={continuar} className="btn-primary mt-5 w-full">
                  Elegir mis butacas
                </button>
              </>
            ) : (
              <>
                <div className="mt-4 flex flex-col gap-3">
                  {tipos.map((t) => {
                    const disponibles = t.cupo - t.vendidas
                    const agotado = disponibles <= 0
                    const cant = carrito[t.id] || 0
                    return (
                      <div
                        key={t.id}
                        className={
                          'rounded-2xl border p-4 transition-colors ' +
                          (agotado
                            ? 'border-white/5 bg-white/[0.02] opacity-60'
                            : 'border-white/10 bg-white/[0.03] hover:border-electric-400/30')
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {t.nombre}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-500">
                              {agotado
                                ? 'Agotado'
                                : disponibles <= 10
                                ? `Quedan ${disponibles}`
                                : 'Disponible'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-semibold text-electric-200">
                              {formatCLP(t.precio)}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          {agotado ? (
                            <span className="chip-danger">Agotado</span>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              Máx. {Math.min(8, disponibles)}
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCant(t.id, cant - 1)}
                              disabled={cant === 0}
                              className="rounded-lg border border-white/10 p-1.5 text-slate-300 hover:bg-white/5 disabled:opacity-30"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center font-mono text-sm">
                              {cant}
                            </span>
                            <button
                              onClick={() => setCant(t.id, cant + 1)}
                              disabled={
                                agotado || cant >= Math.min(8, disponibles)
                              }
                              className="rounded-lg border border-electric-400/30 bg-electric-400/10 p-1.5 text-electric-200 hover:bg-electric-400/20 disabled:opacity-30"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="my-5 divider" />

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
                  disabled={cantidad === 0}
                  onClick={continuar}
                  className="btn-primary mt-5 w-full"
                >
                  Ir a pagar · {cantidad} entrada{cantidad === 1 ? '' : 's'}
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function Feature({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-slate-300">
      <CheckCircle2 className="h-4 w-4 text-electric-300" />
      <span className="text-xs">{label}</span>
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
