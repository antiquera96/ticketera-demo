import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import PageHeader from '../../components/PageHeader'
import { uid } from '../../utils/id'
import type { Evento, ModoEvento, TipoEntrada } from '../../types'

const PASOS = ['Información', 'Entradas o butacas', 'Publicación'] as const

export default function EventEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    state,
    upsertEvento,
    upsertTipoEntrada,
    removeTipoEntrada,
    getTiposEntradaByEvento,
  } = useStore()

  const editing = id ? state.eventos.find((e) => e.id === id) : null
  const [paso, setPaso] = useState(0)

  const [draft, setDraft] = useState<Evento>(
    () =>
      editing ?? {
        id: uid('ev'),
        nombre: '',
        descripcion: '',
        fecha: new Date().toISOString().slice(0, 10),
        hora: '21:00',
        lugar: '',
        ciudad: 'Santiago',
        imagen:
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80',
        estado: 'borrador',
        modo: 'general',
        productorId: state.productorActualId,
        cargoServicioPct: 12,
      },
  )

  const tiposExistentes = useMemo(
    () => (editing ? getTiposEntradaByEvento(draft.id) : []),
    [editing, draft.id, getTiposEntradaByEvento],
  )

  const [tipos, setTipos] = useState<TipoEntrada[]>(() =>
    editing && tiposExistentes.length
      ? tiposExistentes
      : draft.modo === 'general'
      ? [
          {
            id: uid('te'),
            eventoId: draft.id,
            nombre: 'General',
            precio: 15000,
            cupo: 200,
            vendidas: 0,
          },
        ]
      : [],
  )

  function set<K extends keyof Evento>(k: K, v: Evento[K]) {
    setDraft((d) => ({ ...d, [k]: v }))
  }

  function guardar(estadoOverride?: Evento['estado']) {
    const ev = { ...draft, estado: estadoOverride ?? draft.estado }
    upsertEvento(ev)
    if (ev.modo === 'general') {
      for (const t of tipos) {
        upsertTipoEntrada({ ...t, eventoId: ev.id })
      }
      // remover los borrados
      for (const t of tiposExistentes) {
        if (!tipos.find((x) => x.id === t.id)) removeTipoEntrada(t.id)
      }
    }
    navigate('/productor')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <button
        onClick={() => navigate('/productor')}
        className="mb-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-electric-300"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al panel
      </button>

      <PageHeader
        eyebrow={editing ? 'Editando evento' : 'Nuevo evento'}
        title={editing ? draft.nombre || 'Editar evento' : 'Crear evento'}
        subtitle="Asistente paso a paso. Puedes guardar como borrador y volver más tarde."
      />

      {/* Stepper */}
      <div className="-mx-4 mb-6 overflow-x-auto px-4 scrollbar-thin sm:mx-0 sm:overflow-visible sm:px-0">
        <div className="flex w-max items-center gap-2 text-xs sm:w-auto sm:gap-3">
          {PASOS.map((p, i) => (
            <div key={p} className="flex items-center gap-2">
              <div
                className={
                  'flex h-7 w-7 flex-none items-center justify-center rounded-full border text-[11px] font-semibold ' +
                  (i <= paso
                    ? 'border-electric-400 bg-electric-400 text-ink-950 shadow-glow-sm'
                    : 'border-white/10 bg-white/5 text-slate-400')
                }
              >
                {i + 1}
              </div>
              <span
                className={
                  'whitespace-nowrap ' +
                  (i <= paso ? 'text-white' : 'text-slate-500')
                }
              >
                {p}
              </span>
              {i < PASOS.length - 1 && (
                <div className="mx-1 h-px w-6 flex-none bg-white/10 sm:w-10" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="panel rounded-3xl p-6 sm:p-8">
        {paso === 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre del evento" full>
              <input
                value={draft.nombre}
                onChange={(e) => set('nombre', e.target.value)}
                className="input"
                placeholder="Ej. Neon Pulse · DJ Set"
              />
            </Field>
            <Field label="Modo">
              <div className="grid grid-cols-2 gap-2">
                {(['general', 'butacas'] as ModoEvento[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => set('modo', m)}
                    className={
                      'rounded-xl border px-3 py-2.5 text-sm capitalize ' +
                      (draft.modo === m
                        ? 'border-electric-400/50 bg-electric-400/10 text-electric-200'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-electric-400/30')
                    }
                  >
                    {m === 'general' ? 'Admisión general' : 'Butacas numeradas'}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Fecha">
              <input
                type="date"
                value={draft.fecha}
                onChange={(e) => set('fecha', e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Hora">
              <input
                type="time"
                value={draft.hora}
                onChange={(e) => set('hora', e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Lugar / sala">
              <input
                value={draft.lugar}
                onChange={(e) => set('lugar', e.target.value)}
                className="input"
                placeholder="Ej. Teatro Caupolicán"
              />
            </Field>
            <Field label="Ciudad">
              <input
                value={draft.ciudad}
                onChange={(e) => set('ciudad', e.target.value)}
                className="input"
              />
            </Field>
            <Field label="URL de imagen de portada" full>
              <input
                value={draft.imagen}
                onChange={(e) => set('imagen', e.target.value)}
                className="input"
                placeholder="https://…"
              />
            </Field>
            <Field label="Descripción" full>
              <textarea
                value={draft.descripcion}
                onChange={(e) => set('descripcion', e.target.value)}
                rows={4}
                className="input"
                placeholder="Cuéntale al público de qué se trata el evento."
              />
            </Field>
            <Field label="Cargo por servicio (%)">
              <input
                type="number"
                min={0}
                max={30}
                value={draft.cargoServicioPct}
                onChange={(e) =>
                  set('cargoServicioPct', Number(e.target.value) || 0)
                }
                className="input"
              />
            </Field>
          </div>
        )}

        {paso === 1 && (
          <div>
            {draft.modo === 'general' ? (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Tipos de entrada
                    </div>
                    <div className="text-xs text-slate-500">
                      Define nombre, precio y cupo para cada tipo.
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setTipos((arr) => [
                        ...arr,
                        {
                          id: uid('te'),
                          eventoId: draft.id,
                          nombre: 'Nueva entrada',
                          precio: 10000,
                          cupo: 50,
                          vendidas: 0,
                        },
                      ])
                    }
                    className="btn-ghost"
                  >
                    <Plus className="h-3.5 w-3.5" /> Agregar tipo
                  </button>
                </div>
                <div className="space-y-2">
                  {tipos.map((t) => (
                    <div
                      key={t.id}
                      className="grid grid-cols-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                    >
                      <input
                        value={t.nombre}
                        onChange={(e) =>
                          setTipos((arr) =>
                            arr.map((x) =>
                              x.id === t.id
                                ? { ...x, nombre: e.target.value }
                                : x,
                            ),
                          )
                        }
                        className="input col-span-12 sm:col-span-5"
                      />
                      <div className="col-span-6 sm:col-span-3">
                        <input
                          type="number"
                          value={t.precio}
                          onChange={(e) =>
                            setTipos((arr) =>
                              arr.map((x) =>
                                x.id === t.id
                                  ? {
                                      ...x,
                                      precio: Number(e.target.value) || 0,
                                    }
                                  : x,
                              ),
                            )
                          }
                          className="input"
                          placeholder="Precio"
                        />
                      </div>
                      <div className="col-span-5 sm:col-span-3">
                        <input
                          type="number"
                          value={t.cupo}
                          onChange={(e) =>
                            setTipos((arr) =>
                              arr.map((x) =>
                                x.id === t.id
                                  ? { ...x, cupo: Number(e.target.value) || 0 }
                                  : x,
                              ),
                            )
                          }
                          className="input"
                          placeholder="Cupo"
                        />
                      </div>
                      <button
                        onClick={() =>
                          setTipos((arr) => arr.filter((x) => x.id !== t.id))
                        }
                        className="col-span-1 flex justify-center text-slate-500 hover:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-electric-400/20 bg-electric-400/[0.05] p-5 text-sm text-electric-100">
                Este evento usa <strong>butacas numeradas</strong>. Una vez
                guardado, podrás diseñar el mapa de butacas desde el panel.
              </div>
            )}
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="text-sm font-semibold text-white">Resumen</div>
              <ul className="mt-2 grid grid-cols-1 gap-2 text-sm text-slate-300 sm:grid-cols-2">
                <li>
                  <span className="text-slate-500">Evento:</span>{' '}
                  {draft.nombre || '—'}
                </li>
                <li>
                  <span className="text-slate-500">Modo:</span>{' '}
                  {draft.modo === 'butacas'
                    ? 'Butacas numeradas'
                    : 'Admisión general'}
                </li>
                <li>
                  <span className="text-slate-500">Fecha:</span> {draft.fecha} ·{' '}
                  {draft.hora}
                </li>
                <li>
                  <span className="text-slate-500">Lugar:</span> {draft.lugar},{' '}
                  {draft.ciudad}
                </li>
                {draft.modo === 'general' && (
                  <li className="sm:col-span-2">
                    <span className="text-slate-500">Tipos:</span>{' '}
                    {tipos.map((t) => t.nombre).join(', ') || '—'}
                  </li>
                )}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button onClick={() => guardar('borrador')} className="btn-ghost">
                <Save className="h-4 w-4" /> Guardar como borrador
              </button>
              <button
                onClick={() => guardar('publicado')}
                className="btn-primary"
              >
                Publicar evento
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setPaso((p) => Math.max(0, p - 1))}
            disabled={paso === 0}
            className="btn-ghost"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
          {paso < PASOS.length - 1 && (
            <button
              onClick={() => setPaso((p) => p + 1)}
              className="btn-primary"
            >
              Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  full,
}: {
  label: string
  children: any
  full?: boolean
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <div className="label">{label}</div>
      {children}
    </div>
  )
}
