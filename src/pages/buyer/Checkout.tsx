import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Lock,
  Timer,
  XCircle,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { formatCLP } from '../../utils/format'

type DraftGeneral = {
  modo: 'general'
  eventoId: string
  items: { tipoEntradaId: string; cantidad: number }[]
}
type DraftButacas = {
  modo: 'butacas'
  eventoId: string
  asientoIds: string[]
}
type Draft = DraftGeneral | DraftButacas

const RESERVE_MIN = 10

export default function Checkout() {
  const { eventoId } = useParams()
  const navigate = useNavigate()
  const {
    getEvento,
    getTiposEntradaByEvento,
    getSectoresByEvento,
    state,
    reservarAsientos,
    liberarAsientos,
    crearOrdenGeneral,
    crearOrdenButacas,
    validarCodigo,
  } = useStore()

  const [draft, setDraft] = useState<Draft | null>(() => {
    try {
      const raw = sessionStorage.getItem('checkout_items')
      return raw ? (JSON.parse(raw) as Draft) : null
    } catch {
      return null
    }
  })
  const [nombre, setNombre] = useState('Camila Soto')
  const [email, setEmail] = useState('camila@example.com')
  const [codigo, setCodigo] = useState('')
  const [codigoStatus, setCodigoStatus] = useState<'idle' | 'ok' | 'invalid'>(
    'idle',
  )
  const [paying, setPaying] = useState<'idle' | 'loading' | 'rejected'>('idle')
  const [now, setNow] = useState(Date.now())
  const reservedRef = useRef(false)

  const evento = useMemo(() => getEvento(eventoId!), [eventoId, getEvento])

  // reservar butacas al entrar al checkout
  useEffect(() => {
    if (!draft || draft.modo !== 'butacas' || reservedRef.current) return
    reservarAsientos(draft.asientoIds, RESERVE_MIN)
    reservedRef.current = true
    return () => {
      // si abandonamos sin pagar, liberar
      if (reservedRef.current) {
        liberarAsientos(draft.asientoIds)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // tick para countdown
  useEffect(() => {
    if (!draft || draft.modo !== 'butacas') return
    const i = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(i)
  }, [draft])

  if (!evento || !draft) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-slate-400">
        No hay nada en tu carrito.{' '}
        <button onClick={() => navigate('/')} className="text-electric-300">
          Volver al catálogo
        </button>
      </div>
    )
  }

  // calcular líneas
  const lines: { label: string; precio: number }[] = []
  if (draft.modo === 'general') {
    const tipos = getTiposEntradaByEvento(evento.id)
    for (const it of draft.items) {
      const t = tipos.find((x) => x.id === it.tipoEntradaId)
      if (!t) continue
      for (let i = 0; i < it.cantidad; i++)
        lines.push({ label: t.nombre, precio: t.precio })
    }
  } else {
    const sectores = getSectoresByEvento(evento.id)
    for (const aid of draft.asientoIds) {
      const a = state.asientos.find((x) => x.id === aid)
      const sec = a && sectores.find((s) => s.id === a.sectorId)
      if (a && sec)
        lines.push({
          label: `${sec.nombre} · Fila ${a.fila} · Asiento ${a.numero}`,
          precio: sec.precio,
        })
    }
  }

  const subtotal = lines.reduce((acc, l) => acc + l.precio, 0)
  const codigoValido =
    codigoStatus === 'ok' ? validarCodigo(codigo, evento.id) : undefined
  const descuento = codigoValido
    ? codigoValido.tipo === 'porcentaje'
      ? Math.round((subtotal * codigoValido.valor) / 100)
      : Math.min(codigoValido.valor, subtotal)
    : 0
  const baseConDescuento = Math.max(0, subtotal - descuento)
  const cargo = Math.round((baseConDescuento * evento.cargoServicioPct) / 100)
  const total = baseConDescuento + cargo

  // countdown
  let countdown = ''
  let expired = false
  if (draft.modo === 'butacas') {
    const expira = state.asientos.find((a) => draft.asientoIds.includes(a.id))
      ?.reservadoHasta
    if (expira) {
      const s = Math.max(0, Math.floor((expira - now) / 1000))
      if (s <= 0) expired = true
      const m = Math.floor(s / 60)
      const ss = (s % 60).toString().padStart(2, '0')
      countdown = `${m}:${ss}`
    }
  }

  function aplicarCodigo() {
    const c = validarCodigo(codigo, evento.id)
    setCodigoStatus(c ? 'ok' : 'invalid')
  }

  function pagar(exito: boolean) {
    if (!exito) {
      setPaying('rejected')
      // liberar asientos si era butacas
      if (draft && draft.modo === 'butacas') {
        liberarAsientos(draft.asientoIds)
        reservedRef.current = false
      }
      return
    }
    setPaying('loading')
    setTimeout(() => {
      let result
      if (draft.modo === 'general') {
        result = crearOrdenGeneral({
          eventoId: evento.id,
          items: draft.items,
          compradorNombre: nombre,
          compradorEmail: email,
          codigoDescuento: codigoValido?.codigo,
        })
      } else {
        result = crearOrdenButacas({
          eventoId: evento.id,
          asientoIds: draft.asientoIds,
          compradorNombre: nombre,
          compradorEmail: email,
          codigoDescuento: codigoValido?.codigo,
        })
      }
      reservedRef.current = false
      sessionStorage.removeItem('checkout_items')
      if (result) navigate(`/confirmacion/${result.orden.id}`)
      else setPaying('idle')
    }, 900)
  }

  if (expired) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <div className="panel rounded-2xl p-8">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-300" />
          <h2 className="mt-3 text-xl font-semibold text-white">
            Tu reserva expiró
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Los asientos fueron liberados. Puedes elegir nuevos.
          </p>
          <button
            onClick={() => navigate(`/eventos/${evento.id}/butacas`)}
            className="btn-primary mt-5 w-full"
          >
            Volver al mapa
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
      <button
        onClick={() => navigate(-1)}
        className="my-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-electric-300"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
        {/* PASARELA */}
        <div className="panel rounded-3xl">
          <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-electric-400/15 p-2 text-electric-200">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Pasarela segura
                </div>
                <div className="text-[11px] text-slate-500">
                  Demo · ningún dato real es procesado
                </div>
              </div>
            </div>
            <div className="hidden gap-2 sm:flex">
              <PaymentBadge label="Webpay" />
              <PaymentBadge label="Mercado Pago" />
            </div>
          </div>

          <div className="p-6">
            {countdown && (
              <div className="mb-5 flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-200">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Reserva activa
                </div>
                <span className="font-mono text-base">{countdown}</span>
              </div>
            )}

            <div className="space-y-4">
              <Field
                label="Nombre del comprador"
                value={nombre}
                onChange={setNombre}
              />
              <Field
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
              />

              <div>
                <label className="label">Código de descuento</label>
                <div className="flex gap-2">
                  <input
                    value={codigo}
                    onChange={(e) => {
                      setCodigo(e.target.value)
                      setCodigoStatus('idle')
                    }}
                    placeholder="Ej. PULSE20"
                    className="input uppercase"
                  />
                  <button onClick={aplicarCodigo} className="btn-ghost">
                    Aplicar
                  </button>
                </div>
                {codigoStatus === 'ok' && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Código aplicado · -{formatCLP(descuento)}
                  </div>
                )}
                {codigoStatus === 'invalid' && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-300">
                    <XCircle className="h-3.5 w-3.5" />
                    Código no válido para este evento
                  </div>
                )}
              </div>

              <div>
                <label className="label">Método de pago</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <MethodCard label="Débito Redcompra" selected />
                  <MethodCard label="Crédito Visa / Master" />
                  <MethodCard label="Mercado Pago" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
                  <CreditCard className="h-4 w-4 text-electric-300" />
                  Tarjeta demo
                </div>
                <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 sm:grid-cols-[1fr_auto_auto] sm:gap-3">
                  <input
                    disabled
                    value="4051 8856 0000 0008"
                    className="input font-mono opacity-60"
                  />
                  <input
                    disabled
                    value="12/30"
                    className="input font-mono opacity-60 sm:w-20"
                  />
                  <input
                    disabled
                    value="123"
                    className="input font-mono opacity-60 sm:w-16"
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Esta tarjeta es de demostración. Usa los botones para simular
                  el resultado.
                </p>
              </div>
            </div>

            {paying === 'rejected' && (
              <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">
                <XCircle className="mt-0.5 h-4 w-4 flex-none" />
                <div>
                  <div className="font-medium">Pago rechazado</div>
                  <div className="text-rose-300/80">
                    Tu banco rechazó la transacción. Tus asientos fueron
                    liberados.
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={() => pagar(false)}
                disabled={paying === 'loading'}
                className="btn-danger"
              >
                Simular pago rechazado
              </button>
              <button
                onClick={() => pagar(true)}
                disabled={paying === 'loading'}
                className="btn-primary"
              >
                {paying === 'loading'
                  ? 'Procesando…'
                  : `Pagar ${formatCLP(total)}`}
              </button>
            </div>
          </div>
        </div>

        {/* RESUMEN */}
        <aside>
          <div className="panel rounded-3xl p-5 sm:p-6 md:sticky md:top-20">
            <div className="text-[10px] uppercase tracking-[0.22em] text-electric-300">
              Tu compra
            </div>
            <h3 className="mt-1 text-base font-semibold text-white">
              {evento.nombre}
            </h3>
            <p className="text-xs text-slate-500">
              {evento.lugar}, {evento.ciudad}
            </p>

            <ul className="my-4 space-y-2 text-sm">
              {lines.map((l, i) => (
                <li
                  key={i}
                  className="flex items-start justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2"
                >
                  <span className="text-slate-200">{l.label}</span>
                  <span className="font-medium text-white">
                    {formatCLP(l.precio)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatCLP(subtotal)} />
              {descuento > 0 && (
                <Row
                  label="Descuento"
                  value={'- ' + formatCLP(descuento)}
                  tone="success"
                />
              )}
              <Row
                label={`Cargo por servicio (${evento.cargoServicioPct}%)`}
                value={formatCLP(cargo)}
              />
              <div className="my-2 divider" />
              <Row label="Total" value={formatCLP(total)} strong />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </div>
  )
}

function MethodCard({
  label,
  selected,
}: {
  label: string
  selected?: boolean
}) {
  return (
    <button
      className={
        'rounded-xl border p-3 text-left text-xs transition-colors ' +
        (selected
          ? 'border-electric-400/50 bg-electric-400/10 text-white'
          : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-electric-400/30')
      }
    >
      <div className="text-[10px] uppercase tracking-wider text-electric-300">
        Tarjeta
      </div>
      <div className="mt-1 text-sm font-medium">{label}</div>
    </button>
  )
}

function PaymentBadge({ label }: { label: string }) {
  return (
    <div className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-slate-400">
      {label}
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
  tone?: 'success'
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? 'text-white' : 'text-slate-400'}>{label}</span>
      <span
        className={
          tone === 'success'
            ? 'font-medium text-emerald-300'
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
