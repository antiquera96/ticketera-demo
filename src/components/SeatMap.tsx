import { useMemo } from 'react'
import type { Asiento, EstadoAsiento, Sector } from '../types'

interface Props {
  sectores: Sector[]
  asientos: Asiento[]
  selectedIds?: string[]
  onToggle?: (id: string, asiento: Asiento) => void
  variant?: 'buyer' | 'editor'
}

const styles: Record<EstadoAsiento, string> = {
  disponible:
    'border-electric-400/30 bg-electric-400/10 text-electric-200 hover:bg-electric-400/20 hover:border-electric-400/60',
  reservado: 'border-amber-400/40 bg-amber-400/20 text-amber-200',
  vendido:
    'border-rose-400/40 bg-rose-400/15 text-rose-200/70 cursor-not-allowed',
  bloqueado:
    'border-white/10 bg-white/5 text-slate-600 cursor-not-allowed',
}

export default function SeatMap({
  sectores,
  asientos,
  selectedIds = [],
  onToggle,
  variant = 'buyer',
}: Props) {
  const asientosBySector = useMemo(() => {
    const map: Record<string, Asiento[]> = {}
    for (const a of asientos) {
      ;(map[a.sectorId] ??= []).push(a)
    }
    return map
  }, [asientos])

  return (
    <div className="flex flex-col gap-6">
      {/* Escenario */}
      <div className="mx-auto w-full max-w-2xl">
        <div className="relative rounded-2xl border border-electric-400/30 bg-gradient-to-b from-electric-400/15 to-transparent p-6 text-center">
          <div className="absolute inset-x-12 -top-1 h-1 rounded-full bg-electric-400 shadow-glow" />
          <div className="text-[10px] uppercase tracking-[0.32em] text-electric-200">
            Escenario
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {sectores.map((sector) => {
          const seats = asientosBySector[sector.id] || []
          const byRow: Record<string, Asiento[]> = {}
          for (const a of seats) {
            ;(byRow[a.fila] ??= []).push(a)
          }
          const filas = Object.keys(byRow).sort()
          return (
            <div key={sector.id}>
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {sector.nombre}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {sector.filas} filas · {sector.columnas} asientos
                  </div>
                </div>
                <div className="text-xs text-electric-200">
                  ${sector.precio.toLocaleString('es-CL')}
                </div>
              </div>
              <div className="overflow-x-auto pb-2 scrollbar-thin">
                <div className="inline-flex flex-col gap-1.5 px-1">
                  {filas.map((fila) => (
                    <div key={fila} className="flex items-center gap-1.5">
                      <div className="w-5 text-center text-[10px] font-mono text-slate-500">
                        {fila}
                      </div>
                      {byRow[fila]
                        .sort((a, b) => a.numero - b.numero)
                        .map((a) => {
                          const selected = selectedIds.includes(a.id)
                          const cls = styles[a.estado]
                          return (
                            <button
                              key={a.id}
                              disabled={
                                variant === 'buyer' &&
                                (a.estado === 'vendido' ||
                                  a.estado === 'bloqueado')
                              }
                              onClick={() => onToggle?.(a.id, a)}
                              className={
                                'h-7 w-7 rounded-md border text-[10px] font-medium font-mono transition-all ' +
                                cls +
                                (selected
                                  ? ' !border-electric-400 !bg-electric-400 !text-ink-950 !shadow-glow-sm'
                                  : '')
                              }
                              title={`Fila ${a.fila} · ${a.numero} · ${a.estado}`}
                            >
                              {a.numero}
                            </button>
                          )
                        })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px]">
        <Legend className="border-electric-400/30 bg-electric-400/10" label="Disponible" />
        <Legend className="border-electric-400 bg-electric-400" label="Seleccionado" filled />
        <Legend className="border-amber-400/40 bg-amber-400/20" label="Reservado" />
        <Legend className="border-rose-400/40 bg-rose-400/15" label="Vendido" />
        <Legend className="border-white/10 bg-white/5" label="Bloqueado" />
      </div>
    </div>
  )
}

function Legend({
  className,
  label,
  filled,
}: {
  className: string
  label: string
  filled?: boolean
}) {
  return (
    <div className="flex items-center gap-1.5 text-slate-400">
      <span
        className={'h-3.5 w-3.5 rounded border ' + className + (filled ? '' : '')}
      />
      {label}
    </div>
  )
}
