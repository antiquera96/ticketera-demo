import { QRCodeSVG } from 'qrcode.react'
import { Calendar, MapPin, TicketCheck, User } from 'lucide-react'
import type { Entrada, Evento } from '../types'
import { formatFechaLarga } from '../utils/format'

interface Props {
  entrada: Entrada
  evento: Evento
}

export default function TicketCard({ entrada, evento }: Props) {
  const usada = entrada.estado === 'usada'
  const anulada = entrada.estado === 'anulada'

  return (
    <div className="relative">
      <div
        className={
          'panel relative overflow-hidden rounded-2xl ' +
          (usada || anulada ? 'opacity-60' : '')
        }
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-electric-400 via-electric-300 to-electric-700" />
        <div className="grid gap-0 md:grid-cols-[1fr_auto]">
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              {entrada.esCortesia ? (
                <span className="chip-warn">Cortesía</span>
              ) : (
                <span className="chip-electric">Entrada</span>
              )}
              {usada && (
                <span className="chip-danger">
                  <TicketCheck className="h-3 w-3" /> Usada
                </span>
              )}
              {anulada && <span className="chip-danger">Anulada</span>}
              {!usada && !anulada && (
                <span className="chip-success">Válida</span>
              )}
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white text-balance sm:text-xl">
              {evento.nombre}
            </h3>
            <div className="mt-3 flex flex-col gap-1.5 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-electric-400" />
                {formatFechaLarga(evento.fecha, evento.hora)}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-electric-400" />
                {evento.lugar}, {evento.ciudad}
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-electric-400" />
                {entrada.titular}
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-white/5 bg-ink-900/60 p-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                {entrada.descripcion}
              </div>
              <div className="mt-1 font-mono text-base text-electric-200">
                {entrada.codigoUnico}
              </div>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center border-t border-dashed border-white/10 bg-ink-900/40 p-5 md:border-l md:border-t-0">
            <div className="absolute -top-2 left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-ink-950 md:block" />
            <div className="absolute -bottom-2 left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-ink-950 md:block" />
            <div className="rounded-xl bg-white p-3 shadow-glow-sm">
              <QRCodeSVG
                value={entrada.codigoUnico}
                size={132}
                bgColor="#ffffff"
                fgColor="#03060f"
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Escanea en la puerta
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
