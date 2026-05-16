export function formatCLP(value: number): string {
  if (Number.isNaN(value)) return '$0'
  const rounded = Math.round(value)
  return '$' + rounded.toLocaleString('es-CL')
}

const DIAS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
]
const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

export function formatFechaLarga(fecha: string, hora?: string): string {
  const [y, m, d] = fecha.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const dia = DIAS[date.getDay()]
  const mes = MESES[date.getMonth()]
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  return hora
    ? `${cap(dia)} ${d} de ${mes}, ${hora} hrs`
    : `${cap(dia)} ${d} de ${mes}`
}

export function formatFechaCorta(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number)
  const mes = MESES[m - 1]
  return `${d} ${mes.slice(0, 3)} ${String(y).slice(-2)}`
}

export function formatFechaHora(iso: string): string {
  const date = new Date(iso)
  const f = `${date.getDate().toString().padStart(2, '0')}-${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}-${date.getFullYear()}`
  const h = `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`
  return `${f} · ${h}`
}

export function pluralize(n: number, sing: string, plural: string): string {
  return n === 1 ? sing : plural
}
