import { useMemo, useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import EventCard from '../../components/EventCard'
import type { Evento } from '../../types'

export default function Catalog() {
  const { state, getTiposEntradaByEvento, getSectoresByEvento } = useStore()
  const [q, setQ] = useState('')

  const eventosPublicados = state.eventos.filter(
    (e) => e.estado === 'publicado',
  )
  const filtered = eventosPublicados.filter(
    (e) =>
      e.nombre.toLowerCase().includes(q.toLowerCase()) ||
      e.ciudad.toLowerCase().includes(q.toLowerCase()) ||
      e.lugar.toLowerCase().includes(q.toLowerCase()),
  )

  const featured = useMemo(
    () =>
      filtered.find((e) => e.destacado) ||
      filtered[0],
    [filtered],
  )

  function desdePrecio(evento: Evento): { precio: number; agotado: boolean } {
    if (evento.modo === 'butacas') {
      const secs = getSectoresByEvento(evento.id)
      const precio = secs.length ? Math.min(...secs.map((s) => s.precio)) : 0
      return { precio, agotado: false }
    }
    const tipos = getTiposEntradaByEvento(evento.id)
    if (!tipos.length) return { precio: 0, agotado: false }
    const disponibles = tipos.filter((t) => t.vendidas < t.cupo)
    const precio = (disponibles.length ? disponibles : tipos).reduce(
      (min, t) => Math.min(min, t.precio),
      Infinity,
    )
    return { precio, agotado: disponibles.length === 0 }
  }

  return (
    <div>
      {/* HERO */}
      {featured && <Hero evento={featured} />}

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16">
        <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center sm:gap-4">
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-electric-400/30 bg-electric-400/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-electric-200">
              <Sparkles className="h-3 w-3" /> Próximos eventos
            </div>
            <h2 className="text-xl font-semibold text-white sm:text-3xl">
              Lo que viene en escena
            </h2>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-9"
              placeholder="Buscar por nombre, sala o ciudad…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="panel rounded-2xl p-12 text-center text-slate-400">
            No encontramos eventos. Prueba con otro término.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => {
              const { precio, agotado } = desdePrecio(e)
              return (
                <EventCard
                  key={e.id}
                  evento={e}
                  desde={precio}
                  agotado={agotado}
                />
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function Hero({ evento }: { evento: Evento }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={evento.imagen}
          alt=""
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/95 to-ink-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/80" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 md:grid-cols-2 md:py-20">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-electric-400/40 bg-electric-400/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-electric-200">
            <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full bg-electric-300" />
            En cartelera ahora
          </div>
          <h1 className="text-balance text-[34px] font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
            La energía del evento, <span className="text-electric-300 glow-text">ya en tus manos</span>.
          </h1>
          <p className="mt-4 max-w-lg text-sm text-slate-300 sm:text-base md:text-lg">
            Compra entradas para los mejores eventos en Chile. E-ticket con QR
            al instante, sin filas, sin papel.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
            <a href="#catalogo" className="btn-primary">
              Ver eventos
            </a>
            <a href="/mis-entradas" className="btn-ghost">
              Mis entradas
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-400 sm:mt-8 sm:gap-x-6 sm:text-xs">
            <Bullet label="Pago seguro simulado" />
            <Bullet label="E-ticket con QR único" />
            <Bullet label="Boleta SII al instante" />
          </div>
        </div>
        <div className="relative hidden md:block">
          <div className="absolute -inset-10 rounded-full bg-electric-400/20 blur-3xl" />
          <div className="panel relative ml-auto w-full max-w-md overflow-hidden rounded-3xl">
            <img
              src={evento.imagen}
              alt={evento.nombre}
              className="h-72 w-full object-cover"
            />
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-electric-300">
                Destacado
              </div>
              <div className="mt-1 text-lg font-semibold text-white">
                {evento.nombre}
              </div>
              <div className="mt-1 text-sm text-slate-400">
                {evento.lugar}, {evento.ciudad}
              </div>
              <a
                href={`/eventos/${evento.id}`}
                className="btn-primary mt-4 w-full"
              >
                Ver detalle
              </a>
            </div>
          </div>
        </div>
      </div>
      <div id="catalogo" />
    </section>
  )
}

function Bullet({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-1 w-1 rounded-full bg-electric-400 shadow-glow-sm" />
      {label}
    </div>
  )
}
