export function uid(prefix = ''): string {
  const random = Math.random().toString(36).slice(2, 9)
  const time = Date.now().toString(36).slice(-4)
  return `${prefix}${prefix ? '_' : ''}${time}${random}`
}

export function ticketCode(): string {
  const part = () =>
    Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
  return `${part()}-${part()}-${part()}`
}
