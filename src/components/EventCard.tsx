import { Link } from 'react-router-dom'
import { Calendar, MapPin, Sparkles } from 'lucide-react'
import type { Evento } from '../types'
import { formatCLP, formatFechaCorta } from '../utils/format'

interface Props {
  evento: Evento
  desde: number
  agotado?: boolean
  href?: string
}

export default function EventCard({ evento, desde, agotado, href }: Props) {
  const to = href ?? `/eventos/${evento.id}`
  return (
    <Link
      to={to}
      className="panel panel-hover group relative overflow-hidden rounded-2xl"
    >
      <div className="relative h-44 overflow-hidden sm:h-56">
        <img
          src={evento.imagen}
          alt={evento.nombre}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-electric-500/20 via-transparent to-transparent opacity-60 mix-blend-overlay" />
        <div className="absolute left-3 top-3 flex gap-2">
          {evento.destacado && (
            <span className="chip-electric">
              <Sparkles className="h-3 w-3" /> Destacado
            </span>
          )}
          {agotado && <span className="chip-danger">Agotado</span>}
          {evento.modo === 'butacas' && (
            <span className="chip">Butacas numeradas</span>
          )}
        </div>
        <div className="absolute bottom-3 right-3">
          <div className="rounded-xl bg-ink-950/80 px-3 py-1.5 text-right backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-[0.2em] text-electric-300">
              Desde
            </div>
            <div className="text-base font-semibold text-white">
              {formatCLP(desde)}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-white text-balance">
          {evento.nombre}
        </h3>
        <div className="mt-2 flex flex-col gap-1.5 text-sm text-slate-400 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-electric-400" />
            {formatFechaCorta(evento.fecha)} · {evento.hora}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-electric-400" />
            {evento.lugar}, {evento.ciudad}
          </div>
        </div>
      </div>
    </Link>
  )
}
