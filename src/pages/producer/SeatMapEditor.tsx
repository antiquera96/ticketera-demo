import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import PageHeader from '../../components/PageHeader'
import SeatMap from '../../components/SeatMap'
import { uid } from '../../utils/id'
import type { Sector } from '../../types'

export default function SeatMapEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getEvento,
    getSectoresByEvento,
    state,
    upsertSector,
    removeSector,
    toggleAsientoBloqueado,
  } = useStore()

  const evento = getEvento(id!)
  const sectores = useMemo(
    () => (evento ? getSectoresByEvento(evento.id) : []),
    [evento, getSectoresByEvento],
  )

  const [activeSectorId, setActiveSectorId] = useState<string | null>(
    sectores[0]?.id ?? null,
  )

  if (!evento) return null

  const asientos = state.asientos.filter((a) =>
    sectores.some((s) => s.id === a.sectorId),
  )

  function nuevoSector() {
    if (!evento) return
    const s: Sector = {
      id: uid('sec'),
      eventoId: evento.id,
      nombre: `Sector ${sectores.length + 1}`,
      filas: 4,
      columnas: 8,
      precio: 15000,
    }
    upsertSector(s)
    setActiveSectorId(s.id)
  }

  function actualizar(s: Sector, patch: Partial<Sector>) {
    upsertSector({ ...s, ...patch })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <button
        onClick={() => navigate('/productor')}
        className="mb-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-electric-300"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al panel
      </button>

      <PageHeader
        eyebrow="Editor de recinto"
        title={`Mapa de butacas · ${evento.nombre}`}
        subtitle="Define sectores con filas y columnas. Haz clic sobre los asientos para bloquearlos (pasillos, columnas, etc.)."
        actions={
          <button onClick={nuevoSector} className="btn-primary">
            <Plus className="h-4 w-4" /> Nuevo sector
          </button>
        }
      />

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          {sectores.map((s) => (
            <div
              key={s.id}
              className={
                'panel rounded-2xl p-4 transition-colors ' +
                (s.id === activeSectorId
                  ? 'border-electric-400/50 shadow-glow-sm'
                  : '')
              }
            >
              <div className="mb-3 flex items-center justify-between">
                <input
                  value={s.nombre}
                  onChange={(e) => actualizar(s, { nombre: e.target.value })}
                  className="input"
                />
                <button
                  onClick={() => removeSector(s.id)}
                  className="ml-2 rounded-lg p-2 text-slate-500 hover:text-rose-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Mini label="Filas">
                  <input
                    type="number"
                    value={s.filas}
                    min={1}
                    max={20}
                    onChange={(e) =>
                      actualizar(s, {
                        filas: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                    className="input p-2 text-sm"
                  />
                </Mini>
                <Mini label="Cols.">
                  <input
                    type="number"
                    value={s.columnas}
                    min={1}
                    max={30}
                    onChange={(e) =>
                      actualizar(s, {
                        columnas: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                    className="input p-2 text-sm"
                  />
                </Mini>
                <Mini label="Precio">
                  <input
                    type="number"
                    value={s.precio}
                    onChange={(e) =>
                      actualizar(s, { precio: Number(e.target.value) || 0 })
                    }
                    className="input p-2 text-sm"
                  />
                </Mini>
              </div>
              <button
                onClick={() => setActiveSectorId(s.id)}
                className="mt-3 w-full rounded-lg border border-electric-400/30 bg-electric-400/10 py-1.5 text-xs text-electric-200 hover:bg-electric-400/20"
              >
                Editar bloqueos
              </button>
            </div>
          ))}
          {sectores.length === 0 && (
            <div className="panel rounded-2xl p-6 text-center text-sm text-slate-400">
              Aún no creas sectores. Empieza con uno.
            </div>
          )}
        </aside>

        <div className="panel rounded-3xl p-5 sm:p-7">
          {sectores.length === 0 ? (
            <div className="grid place-items-center py-20 text-slate-500">
              Crea un sector para empezar a diseñar.
            </div>
          ) : (
            <SeatMap
              sectores={sectores}
              asientos={asientos}
              variant="editor"
              onToggle={(asientoId, a) => {
                if (a.estado === 'vendido' || a.estado === 'reservado') return
                toggleAsientoBloqueado(asientoId)
              }}
            />
          )}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => navigate('/productor')}
              className="btn-primary"
            >
              <Save className="h-4 w-4" /> Guardar y volver
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Mini({ label, children }: { label: string; children: any }) {
  return (
    <label className="block text-[10px] uppercase tracking-wider text-slate-500">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  )
}
