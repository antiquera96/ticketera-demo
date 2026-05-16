import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import {
  LayoutGrid,
  Menu,
  Radio,
  Ticket,
  TicketCheck,
  Wand2,
  X,
} from 'lucide-react'
import RoleSwitcher from './RoleSwitcher'
import { useRole } from '../context/RoleContext'
import { useStore } from '../context/StoreContext'

export default function Layout({ children }: { children: ReactNode }) {
  const { role } = useRole()
  const { reset } = useStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const navByRole: Record<string, { label: string; href: string; icon: any }[]> = {
    comprador: [
      { label: 'Catálogo', href: '/', icon: LayoutGrid },
      { label: 'Mis entradas', href: '/mis-entradas', icon: Ticket },
    ],
    productor: [
      { label: 'Mis eventos', href: '/productor', icon: LayoutGrid },
    ],
    control: [{ label: 'Validador', href: '/control', icon: TicketCheck }],
  }

  const items = navByRole[role]

  const handleReset = () => {
    if (
      confirm(
        '¿Reiniciar los datos de la demo? Se perderán las órdenes y cambios.',
      )
    ) {
      reset()
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-100">
      {/* TOPBAR */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="rounded-lg border border-white/10 bg-white/5 p-2 md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menú"
            >
              {open ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
            <Link to="/" className="flex items-center gap-2.5">
              <BrandMark />
              <div className="leading-none">
                <div className="text-base font-semibold tracking-tight text-white">
                  Pulse
                </div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-electric-300">
                  Ticketera
                </div>
              </div>
            </Link>

            <nav className="ml-6 hidden items-center gap-1 md:flex">
              {items.map((it) => {
                const Icon = it.icon
                const active =
                  it.href === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(it.href)
                return (
                  <Link
                    key={it.href}
                    to={it.href}
                    className={
                      'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ' +
                      (active
                        ? 'bg-electric-400/10 text-electric-200'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-100')
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {it.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleReset}
              className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-electric-400/30 hover:text-electric-200 sm:flex"
              title="Reiniciar datos de la demo"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Reiniciar demo
            </button>
            <RoleSwitcher />
          </div>
        </div>

        {/* MOBILE NAV */}
        {open && (
          <div className="border-t border-white/5 bg-ink-950/95 px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {items.map((it) => {
                const Icon = it.icon
                return (
                  <Link
                    key={it.href}
                    to={it.href}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-electric-200"
                  >
                    <Icon className="h-4 w-4" />
                    {it.label}
                  </Link>
                )
              })}
              <button
                onClick={handleReset}
                className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-sm text-slate-300"
              >
                <Wand2 className="h-4 w-4" /> Reiniciar datos demo
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/5 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-electric-400" />
            Pulse · Maqueta demo de ticketera · Chile
          </div>
          <div>Datos simulados. Pagos y boletas no son reales.</div>
        </div>
      </footer>
    </div>
  )
}

function BrandMark() {
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 rounded-xl bg-electric-400/30 blur-xl" />
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric-300 to-electric-700 shadow-glow-sm">
        <Ticket className="h-4.5 w-4.5 text-ink-950" strokeWidth={2.6} />
      </div>
    </div>
  )
}
