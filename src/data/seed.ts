import type {
  Asiento,
  Boleta,
  CodigoDescuento,
  Devolucion,
  Entrada,
  Evento,
  Liquidacion,
  Orden,
  Productor,
  Sector,
  StoreState,
  TipoEntrada,
} from '../types'
import { ticketCode, uid } from '../utils/id'

const PRODUCTOR_ID = 'prod_demo'

const productor: Productor = {
  id: PRODUCTOR_ID,
  nombre: 'Productora Demo',
}

const eventos: Evento[] = [
  {
    id: 'ev_neon',
    nombre: 'Neon Pulse · DJ Set',
    descripcion:
      'Una noche de electrónica futurista con visuales inmersivos y una puesta en escena que mezcla láser, humo y bajos profundos. Una experiencia diseñada para perderte entre la luz azul y el sonido.',
    fecha: '2026-07-12',
    hora: '22:00',
    lugar: 'Estación Mapocho',
    ciudad: 'Santiago',
    imagen:
      'https://images.unsplash.com/photo-1571266028243-d220c6a6e2c2?auto=format&fit=crop&w=1600&q=80',
    estado: 'publicado',
    modo: 'general',
    productorId: PRODUCTOR_ID,
    cargoServicioPct: 12,
    destacado: true,
  },
  {
    id: 'ev_indie',
    nombre: 'Indie Nights · Trío Acústico',
    descripcion:
      'Tres bandas, una noche, un escenario íntimo. Una velada acústica con lo mejor del indie chileno y un público que escucha.',
    fecha: '2026-06-28',
    hora: '21:00',
    lugar: 'Centro Cultural Gabriela Mistral',
    ciudad: 'Santiago',
    imagen:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80',
    estado: 'publicado',
    modo: 'general',
    productorId: PRODUCTOR_ID,
    cargoServicioPct: 12,
  },
  {
    id: 'ev_teatro',
    nombre: 'Hamlet · Reinvención',
    descripcion:
      'Una reinterpretación contemporánea del clásico de Shakespeare con dirección de Marina Vidal. Función única con butacas numeradas.',
    fecha: '2026-08-15',
    hora: '20:30',
    lugar: 'Teatro Municipal',
    ciudad: 'Valparaíso',
    imagen:
      'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1600&q=80',
    estado: 'publicado',
    modo: 'butacas',
    productorId: PRODUCTOR_ID,
    cargoServicioPct: 12,
  },
  {
    id: 'ev_stand',
    nombre: 'Stand Up · Risas en Voltaje',
    descripcion:
      'Cuatro comediantes en vivo. Una noche de humor afilado, observaciones absurdas y mucha cerveza fría.',
    fecha: '2026-05-30',
    hora: '21:30',
    lugar: 'Sala SCD Bellavista',
    ciudad: 'Santiago',
    imagen:
      'https://images.unsplash.com/photo-1527224538127-2104bb71c51b?auto=format&fit=crop&w=1600&q=80',
    estado: 'publicado',
    modo: 'general',
    productorId: PRODUCTOR_ID,
    cargoServicioPct: 12,
  },
]

const tiposEntrada: TipoEntrada[] = [
  // Neon Pulse
  {
    id: 'te_neon_general',
    eventoId: 'ev_neon',
    nombre: 'General',
    precio: 18000,
    cupo: 400,
    vendidas: 312,
  },
  {
    id: 'te_neon_vip',
    eventoId: 'ev_neon',
    nombre: 'VIP · Pista preferencial',
    precio: 38000,
    cupo: 100,
    vendidas: 97,
  },
  {
    id: 'te_neon_early',
    eventoId: 'ev_neon',
    nombre: 'Early Bird',
    precio: 12000,
    cupo: 50,
    vendidas: 50,
  },
  // Indie Nights
  {
    id: 'te_indie_general',
    eventoId: 'ev_indie',
    nombre: 'General',
    precio: 15000,
    cupo: 250,
    vendidas: 118,
  },
  {
    id: 'te_indie_vip',
    eventoId: 'ev_indie',
    nombre: 'VIP · Mesa frente al escenario',
    precio: 32000,
    cupo: 40,
    vendidas: 22,
  },
  // Stand Up
  {
    id: 'te_stand_general',
    eventoId: 'ev_stand',
    nombre: 'General',
    precio: 9000,
    cupo: 180,
    vendidas: 64,
  },
  {
    id: 'te_stand_premium',
    eventoId: 'ev_stand',
    nombre: 'Premium · Primeras filas',
    precio: 16000,
    cupo: 40,
    vendidas: 12,
  },
]

// Hamlet — recinto butacas
const sectores: Sector[] = [
  {
    id: 'sec_platea',
    eventoId: 'ev_teatro',
    nombre: 'Platea',
    filas: 6,
    columnas: 12,
    precio: 28000,
  },
  {
    id: 'sec_balcon',
    eventoId: 'ev_teatro',
    nombre: 'Balcón',
    filas: 4,
    columnas: 10,
    precio: 18000,
  },
]

function buildAsientos(): Asiento[] {
  const out: Asiento[] = []
  for (const sector of sectores) {
    for (let f = 0; f < sector.filas; f++) {
      const fila = String.fromCharCode(65 + f)
      for (let c = 1; c <= sector.columnas; c++) {
        out.push({
          id: `${sector.id}_${fila}${c}`,
          sectorId: sector.id,
          fila,
          numero: c,
          estado: 'disponible',
        })
      }
    }
  }
  // bloquear pasillos
  for (const id of [
    'sec_platea_A6',
    'sec_platea_A7',
    'sec_platea_B6',
    'sec_platea_B7',
    'sec_balcon_A5',
    'sec_balcon_A6',
  ]) {
    const a = out.find((x) => x.id === id)
    if (a) a.estado = 'bloqueado'
  }
  // marcar algunos vendidos para que se vea con datos
  const vendidos = [
    'sec_platea_A1',
    'sec_platea_A2',
    'sec_platea_A3',
    'sec_platea_B1',
    'sec_platea_B2',
    'sec_platea_C5',
    'sec_platea_D8',
    'sec_balcon_A1',
    'sec_balcon_B3',
    'sec_balcon_C7',
  ]
  for (const id of vendidos) {
    const a = out.find((x) => x.id === id)
    if (a) a.estado = 'vendido'
  }
  return out
}

const asientos = buildAsientos()

const codigos: CodigoDescuento[] = [
  {
    codigo: 'PULSE20',
    eventoId: 'ev_neon',
    tipo: 'porcentaje',
    valor: 20,
    usos: 14,
  },
  {
    codigo: 'INDIE5K',
    eventoId: 'ev_indie',
    tipo: 'monto',
    valor: 5000,
    usos: 6,
  },
]

// Generar órdenes sintéticas (para reportes con datos)
function buildOrdenesYEntradas(): {
  ordenes: Orden[]
  entradas: Entrada[]
  boletas: Boleta[]
  contador: number
} {
  const ordenes: Orden[] = []
  const entradas: Entrada[] = []
  const boletas: Boleta[] = []
  let contador = 1000

  const nombresDemo = [
    ['Camila Soto', 'camila@example.com'],
    ['Diego Reyes', 'diego@example.com'],
    ['Valentina Pino', 'vale@example.com'],
    ['Joaquín Vargas', 'joaquin@example.com'],
    ['Isidora Lagos', 'isi@example.com'],
    ['Matías Núñez', 'matias@example.com'],
  ]

  const ventas = [
    { tipo: 'te_neon_general', cant: 90 },
    { tipo: 'te_neon_vip', cant: 40 },
    { tipo: 'te_neon_early', cant: 50 },
    { tipo: 'te_indie_general', cant: 60 },
    { tipo: 'te_indie_vip', cant: 12 },
    { tipo: 'te_stand_general', cant: 30 },
    { tipo: 'te_stand_premium', cant: 6 },
  ]

  let dayOffset = 0
  for (const venta of ventas) {
    const tipo = tiposEntrada.find((t) => t.id === venta.tipo)!
    const evento = eventos.find((e) => e.id === tipo.eventoId)!
    for (let i = 0; i < venta.cant; i++) {
      const [nombre, email] =
        nombresDemo[(i + dayOffset) % nombresDemo.length]
      const ordenId = uid('ord')
      const subtotal = tipo.precio
      const cargo = Math.round((subtotal * evento.cargoServicioPct) / 100)
      const total = subtotal + cargo
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - (15 - Math.floor(i / 8)))
      fecha.setHours(10 + (i % 12), (i * 7) % 60, 0, 0)
      const orden: Orden = {
        id: ordenId,
        eventoId: evento.id,
        items: [
          {
            tipoEntradaId: tipo.id,
            descripcion: tipo.nombre,
            precio: tipo.precio,
          },
        ],
        subtotal,
        descuento: 0,
        cargoServicio: cargo,
        total,
        estado: 'pagada',
        compradorNombre: nombre,
        compradorEmail: email,
        fecha: fecha.toISOString(),
      }
      ordenes.push(orden)
      entradas.push({
        id: uid('ent'),
        ordenId,
        eventoId: evento.id,
        codigoUnico: ticketCode(),
        descripcion: tipo.nombre,
        titular: nombre,
        estado: 'valida',
        esCortesia: false,
      })
      contador += 1
      boletas.push({
        numero: contador,
        ordenId,
        monto: total,
        fecha: fecha.toISOString(),
      })
    }
    dayOffset += 1
  }
  return { ordenes, entradas, boletas, contador }
}

const built = buildOrdenesYEntradas()

const devoluciones: Devolucion[] = []
const liquidaciones: Liquidacion[] = []

export function getSeedState(): StoreState {
  return {
    productores: [productor],
    eventos,
    tiposEntrada,
    sectores,
    asientos,
    ordenes: built.ordenes,
    entradas: built.entradas,
    codigos,
    boletas: built.boletas,
    devoluciones,
    liquidaciones,
    contadorBoleta: built.contador,
    productorActualId: PRODUCTOR_ID,
  }
}
