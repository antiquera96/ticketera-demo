import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Headphones, Store, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import type { Role } from '../types'

const roles: { id: Role; label: string; icon: any; path: string }[] = [
  { id: 'comprador', label: 'Comprador', icon: UserRound, path: '/' },
  { id: 'productor', label: 'Productor', icon: Store, path: '/productor' },
  { id: 'control', label: 'Control', icon: Headphones, path: '/control' },
]

export default function RoleSwitcher() {
  const { role, setRole } = useRole()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const current = roles.find((r) => r.id === role)!
  const Icon = current.icon

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2 rounded-xl border border-electric-400/30 bg-gradient-to-r from-electric-400/10 to-transparent px-3 py-2 text-sm text-white shadow-glow-sm transition-all hover:border-electric-400/50"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-electric-400/20">
          <Icon className="h-3.5 w-3.5 text-electric-200" />
        </div>
        <div className="hidden text-left leading-tight sm:block">
          <div className="text-[10px] uppercase tracking-[0.2em] text-electric-300">
            Modo
          </div>
          <div className="text-sm font-medium">{current.label}</div>
        </div>
        <span className="font-medium sm:hidden">{current.label}</span>
        <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-electric-300" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right animate-slideUp">
          <div className="panel rounded-2xl p-2">
            <div className="px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Cambiar perspectiva de la demo
            </div>
            {roles.map((r) => {
              const RIcon = r.icon
              const active = r.id === role
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setRole(r.id)
                    setOpen(false)
                    navigate(r.path)
                  }}
                  className={
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ' +
                    (active
                      ? 'bg-electric-400/10 text-electric-100'
                      : 'text-slate-300 hover:bg-white/5')
                  }
                >
                  <div
                    className={
                      'flex h-8 w-8 items-center justify-center rounded-lg border ' +
                      (active
                        ? 'border-electric-400/40 bg-electric-400/15'
                        : 'border-white/10 bg-white/5')
                    }
                  >
                    <RIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{r.label}</div>
                    <div className="text-[11px] text-slate-500">
                      {r.id === 'comprador' &&
                        'Compra entradas y recibe tu e-ticket'}
                      {r.id === 'productor' &&
                        'Crea eventos, reportes y liquidación'}
                      {r.id === 'control' &&
                        'Valida entradas en la puerta'}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
