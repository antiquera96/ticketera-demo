import type { ReactNode } from 'react'

interface Props {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
  tone?: 'default' | 'electric' | 'success' | 'warn'
}

export default function StatCard({ label, value, hint, icon, tone = 'default' }: Props) {
  const tones = {
    default: 'border-white/10 bg-white/[0.03]',
    electric: 'border-electric-400/30 bg-electric-400/[0.06]',
    success: 'border-emerald-400/25 bg-emerald-400/[0.06]',
    warn: 'border-amber-400/25 bg-amber-400/[0.06]',
  }
  return (
    <div className={`rounded-2xl border ${tones[tone]} p-4 sm:p-5`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">
          {label}
        </div>
        {icon && <div className="text-electric-300">{icon}</div>}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {value}
      </div>
      {hint && <div className="mt-1.5 text-xs text-slate-500">{hint}</div>}
    </div>
  )
}
