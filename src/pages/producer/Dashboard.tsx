import { Link } from 'react-router-dom'
import {
  BarChart3,
  Calendar,
  ChevronRight,
  FileText,
  MapPinned,
  Plus,
  Receipt,
  Settings,
  Sparkles,
  TicketCheck,
  Users,
  Wallet,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import { formatCLP, formatFechaCorta } from '../../utils/format'
import type { Evento } from '../../types'

export default function Dashboard() {
  const { state, getTiposEntradaByEvento, getSectoresByEvento, getOrdenesByEvento } =
    useStore()

  const eventos = state.eventos.filter((e) => e.productorId === state.productorActualId)
  const totalIngreso = state.ordenes
    .filter((o) => o.estado === 'pagada')
    .reduce((a, o) => a + o.total, 0)
  const totalEntradas = state.entradas.filter((e) => e.estado !== 'anulada').length
  const totalEventosPublicados = eventos.filter((e) => e.estado === 'publicado').length

  function aforoTotal(e: Evento) {
    if (e.modo === 'general') {
      const tipos = getTiposEntradaByEvento(e.id)
      return {
        vendidas: tipos.reduce((a, t) => a + t.vendidas, 0),
        cupo: tipos.reduce((a, t) => a + t.cupo, 0),
      }
    }
    const sectores = getSectoresByEvento(e.id)
    const cupo = sectores.reduce((a, s) => a + s.filas * s.columnas, 0)
    const vendidas = getOrdenesByEvento(e.id)
      .filter((o) => o.estado === 'pagada')
      .reduce((a, o) => a + o.items.length, 0)
    return { vendidas, cupo }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Panel del productor"
        title="Tus eventos en escena"
        subtitle="Administra eventos, revisa reportes, emite cortesías y gestiona tu liquidación."
        actions={
          <Link to="/productor/eventos/nuevo" className="btn-primary">
            <Plus className="h-4 w-4" />
            Crear nuevo evento
          </Link>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Ingreso total"
          value={formatCLP(totalIngreso)}
          icon={<Wallet className="h-4 w-4" />}
          tone="electric"
        />
        <StatCard
          label="Entradas vendidas"
          value={totalEntradas.toLocaleString('es-CL')}
          icon={<TicketCheck className="h-4 w-4" />}
        />
        <StatCard
          label="Eventos publicados"
          value={totalEventosPublicados.toString()}
          icon={<Sparkles className="h-4 w-4" />}
        />
      </div>

      <div className="space-y-3">
        {eventos.map((e) => {
          const { vendidas, cupo } = aforoTotal(e)
          const pct = cupo ? Math.round((vendidas / cupo) * 100) : 0
          return (
            <div key={e.id} className="panel panel-hover rounded-2xl">
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-[160px_1fr_auto] sm:p-5">
                <div className="relative h-32 w-full overflow-hidden rounded-xl sm:h-full sm:w-[160px]">
                  <img
                    src={e.imagen}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <EstadoChip estado={e.estado} />
                    {e.modo === 'butacas' && (
                      <span className="chip">Butacas</span>
                    )}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    {e.nombre}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-electric-400" />
                      {formatFechaCorta(e.fecha)} · {e.hora}
                    </div>
                    <div>
                      {e.lugar}, {e.ciudad}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          {vendidas.toLocaleString('es-CL')} /{' '}
                          {cupo.toLocaleString('es-CL')} entradas
                        </span>
                        <span className="text-electric-200">{pct}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-electric-400 to-electric-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-col sm:items-stretch">
                  <QuickAction
                    href={`/productor/eventos/${e.id}/editar`}
                    icon={Settings}
                    label="Editar"
                  />
                  {e.modo === 'butacas' && (
                    <QuickAction
                      href={`/productor/eventos/${e.id}/mapa`}
                      icon={MapPinned}
                      label="Mapa"
                    />
                  )}
                  <QuickAction
                    href={`/productor/eventos/${e.id}/cortesias`}
                    icon={Users}
                    label="Cortesías"
                  />
                  <QuickAction
                    href={`/productor/eventos/${e.id}/reportes`}
                    icon={BarChart3}
                    label="Reportes"
                  />
                  <QuickAction
                    href={`/productor/eventos/${e.id}/liquidacion`}
                    icon={Wallet}
                    label="Liquidación"
                  />
                  <QuickAction
                    href={`/productor/eventos/${e.id}/boletas`}
                    icon={Receipt}
                    label="Boletas"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EstadoChip({ estado }: { estado: Evento['estado'] }) {
  const cfg: Record<Evento['estado'], { cls: string; label: string }> = {
    borrador: { cls: 'chip-warn', label: 'Borrador' },
    publicado: { cls: 'chip-success', label: 'Publicado' },
    finalizado: { cls: 'chip', label: 'Finalizado' },
    cancelado: { cls: 'chip-danger', label: 'Cancelado' },
  }
  const c = cfg[estado]
  return <span className={c.cls}>{c.label}</span>
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: any
  label: string
}) {
  return (
    <Link
      to={href}
      className="group flex flex-col items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 text-[11px] text-slate-300 transition-colors hover:border-electric-400/40 hover:text-electric-200 sm:flex-row sm:justify-start sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs"
    >
      <Icon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
      <span>{label}</span>
      <ChevronRight className="hidden h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 sm:inline" />
    </Link>
  )
}
