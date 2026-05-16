export type Role = 'comprador' | 'productor' | 'control'

export type EstadoEvento = 'borrador' | 'publicado' | 'finalizado' | 'cancelado'
export type ModoEvento = 'general' | 'butacas'

export interface Productor {
  id: string
  nombre: string
}

export interface Evento {
  id: string
  nombre: string
  descripcion: string
  fecha: string // ISO date (yyyy-mm-dd)
  hora: string // HH:mm
  lugar: string
  ciudad: string
  imagen: string
  estado: EstadoEvento
  modo: ModoEvento
  productorId: string
  cargoServicioPct: number
  destacado?: boolean
}

export interface TipoEntrada {
  id: string
  eventoId: string
  nombre: string
  precio: number
  cupo: number
  vendidas: number
}

export type EstadoAsiento = 'disponible' | 'reservado' | 'vendido' | 'bloqueado'

export interface Asiento {
  id: string
  sectorId: string
  fila: string
  numero: number
  estado: EstadoAsiento
  reservadoHasta?: number
}

export interface Sector {
  id: string
  eventoId: string
  nombre: string
  filas: number
  columnas: number
  precio: number
}

export interface OrdenItem {
  tipoEntradaId?: string
  asientoId?: string
  descripcion: string
  precio: number
}

export type EstadoOrden = 'pagada' | 'rechazada' | 'reembolsada'

export interface Orden {
  id: string
  eventoId: string
  items: OrdenItem[]
  subtotal: number
  descuento: number
  cargoServicio: number
  total: number
  estado: EstadoOrden
  compradorNombre: string
  compradorEmail: string
  fecha: string // ISO datetime
  codigoDescuento?: string
}

export type EstadoEntrada = 'valida' | 'usada' | 'anulada'

export interface Entrada {
  id: string
  ordenId: string
  eventoId: string
  codigoUnico: string
  descripcion: string
  titular: string
  estado: EstadoEntrada
  esCortesia: boolean
  usadaEn?: string
}

export type TipoDescuento = 'porcentaje' | 'monto'

export interface CodigoDescuento {
  codigo: string
  eventoId: string
  tipo: TipoDescuento
  valor: number
  usos: number
}

export interface Boleta {
  numero: number
  ordenId: string
  monto: number
  fecha: string
}

export interface Devolucion {
  id: string
  ordenId: string
  monto: number
  fecha: string
  motivo: string
}

export interface Liquidacion {
  eventoId: string
  pagadaEn?: string
}

export interface StoreState {
  productores: Productor[]
  eventos: Evento[]
  tiposEntrada: TipoEntrada[]
  sectores: Sector[]
  asientos: Asiento[]
  ordenes: Orden[]
  entradas: Entrada[]
  codigos: CodigoDescuento[]
  boletas: Boleta[]
  devoluciones: Devolucion[]
  liquidaciones: Liquidacion[]
  contadorBoleta: number
  productorActualId: string
}
