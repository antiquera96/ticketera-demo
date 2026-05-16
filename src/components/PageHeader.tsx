import type { ReactNode } from 'react'

interface Props {
  eyebrow?: string
  title: string
  subtitle?: string
  actions?: ReactNode
}

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-electric-400/30 bg-electric-400/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-electric-200">
            <span className="h-1.5 w-1.5 rounded-full bg-electric-300 shadow-glow-sm" />
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm text-slate-400">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
