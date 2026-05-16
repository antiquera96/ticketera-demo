import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  TicketCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'
import { formatCLP } from '../../utils/format'

export default function Reports() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getEvento,
    getTiposEntradaByEvento,
    getSectoresByEvento,
    getOrdenesByEvento,
  } = useStore()

  const evento = getEvento(id!)
  if (!evento) return null

  const ordenes = getOrdenesByEvento(evento.id).filter(
    (o) => o.estado === 'pagada',
  )
  const ingreso = ordenes.reduce((a, o) => a + o.total, 0)
  const cargo = ordenes.reduce((a, o) => a + o.cargoServicio, 0)
  const entradasVendidas = ordenes.reduce((a, o) => a + o.items.length, 0)
  const ticketProm = entradasVendidas
    ? Math.round(ingreso / entradasVendidas)
    : 0

  const tipos = getTiposEntradaByEvento(evento.id)
  const sectores = getSectoresByEvento(evento.id)

  const dataBar = useMemo(() => {
    if (evento.modo === 'general') {
      return tipos.map((t) => ({
        nombre: t.nombre,
        vendidas: t.vendidas,
        ingresos: t.vendidas * t.precio,
      }))
    }
    return sectores.map((s) => {
      const items = ordenes.flatMap((o) => o.items).filter((i) => {
        // butaca pertenece al sector?
        return i.descripcion.startsWith(s.nombre + ' ')
      })
      return {
        nombre: s.nombre,
        vendidas: items.length,
        ingresos: items.length * s.precio,
      }
    })
  }, [evento.modo, tipos, sectores, ordenes])

  const dataLine = useMemo(() => {
    const map: Record<string, { fecha: string; ventas: number; ingreso: number }> =
      {}
    for (const o of ordenes) {
      const d = new Date(o.fecha)
      const key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`
      map[key] = map[key] || { fecha: key, ventas: 0, ingreso: 0 }
      map[key].ventas += o.items.length
      map[key].ingreso += o.total
    }
    return Object.values(map).sort((a, b) => a.fecha.localeCompare(b.fecha))
  }, [ordenes])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <button
        onClick={() => navigate('/productor')}
        className="mb-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-electric-300"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al panel
      </button>

      <PageHeader
        eyebrow="Reportes en tiempo real"
        title={`Performance · ${evento.nombre}`}
        subtitle="Métricas que se actualizan con cada nueva compra. Visualiza tu evento en tiempo real."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Ingreso bruto"
          value={formatCLP(ingreso)}
          icon={<Wallet className="h-4 w-4" />}
          tone="electric"
        />
        <StatCard
          label="Entradas vendidas"
          value={entradasVendidas.toLocaleString('es-CL')}
          icon={<TicketCheck className="h-4 w-4" />}
        />
        <StatCard
          label="Cargo por servicio"
          value={formatCLP(cargo)}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          label="Ticket promedio"
          value={formatCLP(ticketProm)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="panel rounded-3xl p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">
                Ventas por {evento.modo === 'general' ? 'tipo de entrada' : 'sector'}
              </div>
              <div className="text-xs text-slate-500">Unidades vendidas</div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataBar}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06c4ff" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#0084c7" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b3070" />
                <XAxis
                  dataKey="nombre"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#050b1c',
                    border: '1px solid #1b3070',
                    borderRadius: 12,
                  }}
                  labelStyle={{ color: '#bff4ff' }}
                />
                <Bar dataKey="vendidas" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel rounded-3xl p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">
                Ventas en el tiempo
              </div>
              <div className="text-xs text-slate-500">Por día</div>
            </div>
            <Calendar className="h-4 w-4 text-electric-300" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataLine}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1b3070" />
                <XAxis
                  dataKey="fecha"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#050b1c',
                    border: '1px solid #1b3070',
                    borderRadius: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke="#06c4ff"
                  strokeWidth={2.5}
                  dot={{ fill: '#06c4ff', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel mt-4 rounded-3xl">
        <div className="border-b border-white/5 px-5 py-4">
          <div className="text-sm font-semibold text-white">
            Detalle por {evento.modo === 'general' ? 'tipo' : 'sector'}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="whitespace-nowrap px-3 py-3 sm:px-5">Nombre</th>
                <th className="px-3 py-3 sm:px-5">Vendidas</th>
                <th className="px-3 py-3 sm:px-5">Cupo</th>
                <th className="px-3 py-3 sm:px-5">Avance</th>
                <th className="whitespace-nowrap px-3 py-3 text-right sm:px-5">Recaudado</th>
              </tr>
            </thead>
            <tbody>
              {evento.modo === 'general'
                ? tipos.map((t) => (
                    <tr key={t.id} className="border-t border-white/5">
                      <td className="whitespace-nowrap px-3 py-3 text-white sm:px-5">{t.nombre}</td>
                      <td className="px-3 py-3 text-slate-300 sm:px-5">
                        {t.vendidas}
                      </td>
                      <td className="px-3 py-3 text-slate-300 sm:px-5">{t.cupo}</td>
                      <td className="px-3 py-3 sm:px-5">
                        <div className="h-1.5 max-w-[160px] overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-electric-400 to-electric-700"
                            style={{
                              width: `${(t.vendidas / Math.max(1, t.cupo)) * 100}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right font-medium text-electric-200 sm:px-5">
                        {formatCLP(t.vendidas * t.precio)}
                      </td>
                    </tr>
                  ))
                : sectores.map((s) => {
                    const vendidas = ordenes
                      .flatMap((o) => o.items)
                      .filter((i) => i.descripcion.startsWith(s.nombre + ' '))
                      .length
                    const cupo = s.filas * s.columnas
                    return (
                      <tr key={s.id} className="border-t border-white/5">
                        <td className="whitespace-nowrap px-3 py-3 text-white sm:px-5">{s.nombre}</td>
                        <td className="px-3 py-3 text-slate-300 sm:px-5">{vendidas}</td>
                        <td className="px-3 py-3 text-slate-300 sm:px-5">{cupo}</td>
                        <td className="px-3 py-3 sm:px-5">
                          <div className="h-1.5 max-w-[160px] overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full bg-gradient-to-r from-electric-400 to-electric-700"
                              style={{
                                width: `${(vendidas / Math.max(1, cupo)) * 100}%`,
                              }}
                            />
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-medium text-electric-200 sm:px-5">
                          {formatCLP(vendidas * s.precio)}
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
