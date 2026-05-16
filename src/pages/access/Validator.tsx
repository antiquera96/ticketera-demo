import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  ScanLine,
  Search,
  TicketCheck,
  WifiOff,
  XCircle,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import PageHeader from '../../components/PageHeader'
import { formatFechaCorta } from '../../utils/format'

type Resultado = {
  state: 'ok' | 'usada' | 'invalida'
  mensaje: string
  detalle?: string
}

export default function Validator() {
  const { eventoId } = useParams()
  const navigate = useNavigate()
  const { state, validarEntrada, getEvento } = useStore()

  const eventosConEntradas = useMemo(() => {
    const ids = new Set(state.entradas.map((e) => e.eventoId))
    return state.eventos.filter((e) => ids.has(e.id))
  }, [state.entradas, state.eventos])

  const evento = eventoId ? getEvento(eventoId) : eventosConEntradas[0]

  const [codigo, setCodigo] = useState('')
  const [resultado, setResultado] = useState<Resultado | null>(null)

  if (!evento) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center text-slate-400">
        No hay eventos para validar.
      </div>
    )
  }

  const entradasEvento = state.entradas.filter(
    (e) => e.eventoId === evento.id,
  )
  const validadas = entradasEvento.filter((e) => e.estado === 'usada')
  const total = entradasEvento.filter((e) => e.estado !== 'anulada').length

  function onValidar(codigoArg?: string) {
    const c = (codigoArg ?? codigo).trim()
    if (!c) return
    const r = validarEntrada(c)
    if (!r.ok) {
      setResultado({
        state: r.motivo === 'ya-usada' ? 'usada' : 'invalida',
        mensaje:
          r.motivo === 'ya-usada'
            ? 'Entrada ya utilizada'
            : 'Entrada no válida',
        detalle:
          r.motivo === 'ya-usada' && r.entrada
            ? `${r.entrada.titular} · ${r.entrada.descripcion}`
            : 'Verifica el código. No existe en el sistema.',
      })
    } else if (r.entrada) {
      // si validó una entrada de OTRO evento, mostrar de todos modos
      setResultado({
        state: 'ok',
        mensaje: 'Acceso permitido',
        detalle: `${r.entrada.titular} · ${r.entrada.descripcion}`,
      })
    }
    setCodigo('')
  }

  // utilidad para simular escaneo: pegar el código de una entrada válida
  function escanearAleatorio() {
    const pendiente = entradasEvento.find((e) => e.estado === 'valida')
    if (pendiente) {
      onValidar(pendiente.codigoUnico)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Control de acceso · puerta"
        title="Validador de entradas"
        subtitle="Escanea o ingresa el código manualmente. Funciona sin conexión."
        actions={
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200">
            <WifiOff className="h-3.5 w-3.5" /> Modo offline
          </div>
        }
      />

      <div className="mb-5 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
          Evento:
        </span>
        {eventosConEntradas.map((e) => (
          <button
            key={e.id}
            onClick={() => navigate(`/control/${e.id}`)}
            className={
              'whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors ' +
              (e.id === evento.id
                ? 'border-electric-400/50 bg-electric-400/10 text-electric-200'
                : 'border-white/10 bg-white/5 text-slate-400 hover:border-electric-400/30')
            }
          >
            {e.nombre} · {formatFechaCorta(e.fecha)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <div className="panel rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-electric-400/15 p-3 text-electric-200">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                Escanear o ingresar código
              </div>
              <div className="text-xs text-slate-500">
                Formato: XXXX-XXXX-XXXX
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <div className="relative w-full sm:flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onValidar()
                }}
                placeholder="Pega el código…"
                className="input pl-9 font-mono uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
              <button
                onClick={() => onValidar()}
                className="btn-primary w-full sm:w-auto"
              >
                Validar
              </button>
              <button
                onClick={escanearAleatorio}
                className="btn-ghost w-full sm:w-auto"
                title="Simular escaneo de una entrada válida"
              >
                Simular escaneo
              </button>
            </div>
          </div>

          <div className="mt-6">
            {resultado ? <ResultBox resultado={resultado} /> : <Placeholder />}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="panel rounded-3xl p-5 sm:p-6">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Estado de la puerta
            </div>
            <div className="mt-2 text-3xl font-semibold text-white">
              {validadas.length}
              <span className="text-base text-slate-500"> / {total}</span>
            </div>
            <div className="mt-1 text-xs text-electric-200">
              validadas en este evento
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-electric-400 to-electric-700"
                style={{
                  width: `${total ? (validadas.length / total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="panel rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
              <div className="text-sm font-semibold text-white">
                Asistentes ingresados
              </div>
              <span className="chip">{validadas.length}</span>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {validadas.length === 0 ? (
                <div className="px-5 py-8 text-center text-xs text-slate-500">
                  Aún no hay asistentes ingresados.
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {[...validadas].reverse().map((e) => (
                    <li
                      key={e.id}
                      className="flex items-start justify-between px-5 py-3"
                    >
                      <div>
                        <div className="text-sm text-white">{e.titular}</div>
                        <div className="text-[11px] text-slate-500">
                          {e.descripcion}
                        </div>
                      </div>
                      <TicketCheck className="mt-0.5 h-4 w-4 text-emerald-300" />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ResultBox({ resultado }: { resultado: Resultado }) {
  const map = {
    ok: {
      border: 'border-emerald-400/40',
      bg: 'bg-emerald-400/10',
      text: 'text-emerald-200',
      Icon: CheckCircle2,
    },
    usada: {
      border: 'border-rose-400/40',
      bg: 'bg-rose-400/10',
      text: 'text-rose-200',
      Icon: AlertTriangle,
    },
    invalida: {
      border: 'border-rose-400/40',
      bg: 'bg-rose-400/10',
      text: 'text-rose-200',
      Icon: XCircle,
    },
  }
  const cfg = map[resultado.state]
  const Icon = cfg.Icon
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border ${cfg.border} ${cfg.bg} p-5 ${cfg.text}`}
    >
      <Icon className="mt-0.5 h-6 w-6 flex-none" />
      <div>
        <div className="text-lg font-semibold">{resultado.mensaje}</div>
        {resultado.detalle && (
          <div className="mt-0.5 text-sm opacity-80">{resultado.detalle}</div>
        )}
      </div>
    </div>
  )
}

function Placeholder() {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-slate-500">
      Esperando el próximo escaneo…
    </div>
  )
}
