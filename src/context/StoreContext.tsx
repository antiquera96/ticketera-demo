import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Asiento,
  Boleta,
  CodigoDescuento,
  Devolucion,
  Entrada,
  Evento,
  Liquidacion,
  Orden,
  OrdenItem,
  Sector,
  StoreState,
  TipoEntrada,
} from '../types'
import { loadState, resetState, saveState } from '../data/storage'
import { ticketCode, uid } from '../utils/id'

interface StoreApi {
  state: StoreState
  setState: (updater: (s: StoreState) => StoreState) => void
  reset: () => void

  // queries
  getEvento: (id: string) => Evento | undefined
  getTiposEntradaByEvento: (id: string) => TipoEntrada[]
  getSectoresByEvento: (id: string) => Sector[]
  getAsientosBySector: (id: string) => Asiento[]
  getEntradasByOrden: (id: string) => Entrada[]
  getEntradasByEvento: (id: string) => Entrada[]
  getOrdenesByEvento: (id: string) => Orden[]
  getBoletaByOrden: (id: string) => Boleta | undefined
  getCodigosByEvento: (id: string) => CodigoDescuento[]
  getCortesiasByEvento: (id: string) => Entrada[]

  // mutations
  upsertEvento: (e: Evento) => void
  upsertTipoEntrada: (t: TipoEntrada) => void
  removeTipoEntrada: (id: string) => void
  upsertSector: (s: Sector) => void
  removeSector: (id: string) => void
  toggleAsientoBloqueado: (asientoId: string) => void
  reservarAsientos: (asientoIds: string[], minutos?: number) => void
  liberarAsientos: (asientoIds: string[]) => void
  marcarAsientosVendidos: (asientoIds: string[]) => void

  crearOrdenGeneral: (input: {
    eventoId: string
    items: { tipoEntradaId: string; cantidad: number }[]
    compradorNombre: string
    compradorEmail: string
    codigoDescuento?: string
  }) => { orden: Orden; entradas: Entrada[]; boleta: Boleta } | null

  crearOrdenButacas: (input: {
    eventoId: string
    asientoIds: string[]
    compradorNombre: string
    compradorEmail: string
    codigoDescuento?: string
  }) => { orden: Orden; entradas: Entrada[]; boleta: Boleta } | null

  emitirCortesia: (input: {
    eventoId: string
    nombre: string
    email: string
    descripcion?: string
  }) => Entrada

  upsertCodigo: (c: CodigoDescuento) => void
  removeCodigo: (codigo: string) => void
  validarCodigo: (
    codigo: string,
    eventoId: string,
  ) => CodigoDescuento | undefined

  validarEntrada: (codigoUnico: string) => {
    ok: boolean
    motivo?: 'no-existe' | 'ya-usada'
    entrada?: Entrada
    evento?: Evento
  }

  cancelarEvento: (eventoId: string, motivo: string) => void
  reembolsarOrden: (ordenId: string, motivo: string) => void
  marcarLiquidacionPagada: (eventoId: string) => void
}

const StoreContext = createContext<StoreApi | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<StoreState>(() => loadState())

  // Persist on every change
  useEffect(() => {
    saveState(state)
  }, [state])

  const setState = useCallback(
    (updater: (s: StoreState) => StoreState) => {
      setStateRaw((prev) => updater(prev))
    },
    [],
  )

  const reset = useCallback(() => {
    setStateRaw(resetState())
  }, [])

  // ---------- queries ----------
  const getEvento = useCallback(
    (id: string) => state.eventos.find((e) => e.id === id),
    [state.eventos],
  )
  const getTiposEntradaByEvento = useCallback(
    (id: string) => state.tiposEntrada.filter((t) => t.eventoId === id),
    [state.tiposEntrada],
  )
  const getSectoresByEvento = useCallback(
    (id: string) => state.sectores.filter((s) => s.eventoId === id),
    [state.sectores],
  )
  const getAsientosBySector = useCallback(
    (id: string) => state.asientos.filter((a) => a.sectorId === id),
    [state.asientos],
  )
  const getEntradasByOrden = useCallback(
    (id: string) => state.entradas.filter((e) => e.ordenId === id),
    [state.entradas],
  )
  const getEntradasByEvento = useCallback(
    (id: string) => state.entradas.filter((e) => e.eventoId === id),
    [state.entradas],
  )
  const getOrdenesByEvento = useCallback(
    (id: string) => state.ordenes.filter((o) => o.eventoId === id),
    [state.ordenes],
  )
  const getBoletaByOrden = useCallback(
    (id: string) => state.boletas.find((b) => b.ordenId === id),
    [state.boletas],
  )
  const getCodigosByEvento = useCallback(
    (id: string) => state.codigos.filter((c) => c.eventoId === id),
    [state.codigos],
  )
  const getCortesiasByEvento = useCallback(
    (id: string) =>
      state.entradas.filter((e) => e.eventoId === id && e.esCortesia),
    [state.entradas],
  )

  // ---------- mutations ----------
  const upsertEvento = useCallback((e: Evento) => {
    setState((s) => {
      const i = s.eventos.findIndex((x) => x.id === e.id)
      const eventos =
        i === -1 ? [...s.eventos, e] : s.eventos.map((x) => (x.id === e.id ? e : x))
      return { ...s, eventos }
    })
  }, [setState])

  const upsertTipoEntrada = useCallback((t: TipoEntrada) => {
    setState((s) => {
      const i = s.tiposEntrada.findIndex((x) => x.id === t.id)
      const tiposEntrada =
        i === -1
          ? [...s.tiposEntrada, t]
          : s.tiposEntrada.map((x) => (x.id === t.id ? t : x))
      return { ...s, tiposEntrada }
    })
  }, [setState])

  const removeTipoEntrada = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      tiposEntrada: s.tiposEntrada.filter((x) => x.id !== id),
    }))
  }, [setState])

  const upsertSector = useCallback((sector: Sector) => {
    setState((s) => {
      const i = s.sectores.findIndex((x) => x.id === sector.id)
      const sectores =
        i === -1
          ? [...s.sectores, sector]
          : s.sectores.map((x) => (x.id === sector.id ? sector : x))
      // si cambian filas/columnas regeneramos asientos del sector
      const otrosAsientos = s.asientos.filter((a) => a.sectorId !== sector.id)
      const previos = s.asientos.filter((a) => a.sectorId === sector.id)
      const nuevos: Asiento[] = []
      for (let f = 0; f < sector.filas; f++) {
        const fila = String.fromCharCode(65 + f)
        for (let c = 1; c <= sector.columnas; c++) {
          const id = `${sector.id}_${fila}${c}`
          const existente = previos.find((p) => p.id === id)
          nuevos.push(
            existente ?? {
              id,
              sectorId: sector.id,
              fila,
              numero: c,
              estado: 'disponible',
            },
          )
        }
      }
      return { ...s, sectores, asientos: [...otrosAsientos, ...nuevos] }
    })
  }, [setState])

  const removeSector = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      sectores: s.sectores.filter((x) => x.id !== id),
      asientos: s.asientos.filter((a) => a.sectorId !== id),
    }))
  }, [setState])

  const toggleAsientoBloqueado = useCallback((asientoId: string) => {
    setState((s) => ({
      ...s,
      asientos: s.asientos.map((a) =>
        a.id === asientoId
          ? {
              ...a,
              estado:
                a.estado === 'bloqueado'
                  ? 'disponible'
                  : a.estado === 'disponible'
                  ? 'bloqueado'
                  : a.estado,
            }
          : a,
      ),
    }))
  }, [setState])

  const reservarAsientos = useCallback(
    (asientoIds: string[], minutos = 10) => {
      const hasta = Date.now() + minutos * 60 * 1000
      setState((s) => ({
        ...s,
        asientos: s.asientos.map((a) =>
          asientoIds.includes(a.id) && a.estado === 'disponible'
            ? { ...a, estado: 'reservado', reservadoHasta: hasta }
            : a,
        ),
      }))
    },
    [setState],
  )

  const liberarAsientos = useCallback((asientoIds: string[]) => {
    setState((s) => ({
      ...s,
      asientos: s.asientos.map((a) =>
        asientoIds.includes(a.id) && a.estado === 'reservado'
          ? { ...a, estado: 'disponible', reservadoHasta: undefined }
          : a,
      ),
    }))
  }, [setState])

  const marcarAsientosVendidos = useCallback((asientoIds: string[]) => {
    setState((s) => ({
      ...s,
      asientos: s.asientos.map((a) =>
        asientoIds.includes(a.id)
          ? { ...a, estado: 'vendido', reservadoHasta: undefined }
          : a,
      ),
    }))
  }, [setState])

  const validarCodigo = useCallback(
    (codigo: string, eventoId: string) =>
      state.codigos.find(
        (c) => c.codigo.toUpperCase() === codigo.toUpperCase() && c.eventoId === eventoId,
      ),
    [state.codigos],
  )

  // ----- creación de órdenes -----
  const _crearOrdenComun = (
    s: StoreState,
    eventoId: string,
    items: OrdenItem[],
    compradorNombre: string,
    compradorEmail: string,
    codigoDescuento?: string,
  ): { orden: Orden; entradas: Entrada[]; boleta: Boleta } => {
    const evento = s.eventos.find((e) => e.id === eventoId)!
    const subtotal = items.reduce((acc, i) => acc + i.precio, 0)
    let descuento = 0
    let codigoUsado: string | undefined
    if (codigoDescuento) {
      const c = s.codigos.find(
        (x) =>
          x.codigo.toUpperCase() === codigoDescuento.toUpperCase() &&
          x.eventoId === eventoId,
      )
      if (c) {
        descuento =
          c.tipo === 'porcentaje'
            ? Math.round((subtotal * c.valor) / 100)
            : Math.min(c.valor, subtotal)
        codigoUsado = c.codigo
      }
    }
    const baseConDescuento = Math.max(0, subtotal - descuento)
    const cargo = Math.round((baseConDescuento * evento.cargoServicioPct) / 100)
    const total = baseConDescuento + cargo
    const fecha = new Date().toISOString()
    const ordenId = uid('ord')
    const orden: Orden = {
      id: ordenId,
      eventoId,
      items,
      subtotal,
      descuento,
      cargoServicio: cargo,
      total,
      estado: 'pagada',
      compradorNombre,
      compradorEmail,
      fecha,
      codigoDescuento: codigoUsado,
    }
    const entradas: Entrada[] = items.map((i) => ({
      id: uid('ent'),
      ordenId,
      eventoId,
      codigoUnico: ticketCode(),
      descripcion: i.descripcion,
      titular: compradorNombre,
      estado: 'valida',
      esCortesia: false,
    }))
    const numero = s.contadorBoleta + 1
    const boleta: Boleta = { numero, ordenId, monto: total, fecha }
    return { orden, entradas, boleta }
  }

  const crearOrdenGeneral: StoreApi['crearOrdenGeneral'] = useCallback(
    ({ eventoId, items, compradorNombre, compradorEmail, codigoDescuento }) => {
      let resultado: ReturnType<StoreApi['crearOrdenGeneral']> = null
      setState((s) => {
        const evento = s.eventos.find((e) => e.id === eventoId)
        if (!evento) return s
        // validar disponibilidad
        for (const it of items) {
          const t = s.tiposEntrada.find((x) => x.id === it.tipoEntradaId)
          if (!t || t.vendidas + it.cantidad > t.cupo) {
            return s
          }
        }
        // construir items
        const itemsExp: OrdenItem[] = []
        for (const it of items) {
          const t = s.tiposEntrada.find((x) => x.id === it.tipoEntradaId)!
          for (let i = 0; i < it.cantidad; i++) {
            itemsExp.push({
              tipoEntradaId: t.id,
              descripcion: t.nombre,
              precio: t.precio,
            })
          }
        }
        const { orden, entradas, boleta } = _crearOrdenComun(
          s,
          eventoId,
          itemsExp,
          compradorNombre,
          compradorEmail,
          codigoDescuento,
        )
        // descontar cupos
        const tiposEntrada = s.tiposEntrada.map((t) => {
          const it = items.find((x) => x.tipoEntradaId === t.id)
          return it ? { ...t, vendidas: t.vendidas + it.cantidad } : t
        })
        // incrementar usos de código
        const codigos = orden.codigoDescuento
          ? s.codigos.map((c) =>
              c.codigo === orden.codigoDescuento
                ? { ...c, usos: c.usos + 1 }
                : c,
            )
          : s.codigos
        resultado = { orden, entradas, boleta }
        return {
          ...s,
          tiposEntrada,
          codigos,
          ordenes: [...s.ordenes, orden],
          entradas: [...s.entradas, ...entradas],
          boletas: [...s.boletas, boleta],
          contadorBoleta: boleta.numero,
        }
      })
      return resultado
    },
    [setState],
  )

  const crearOrdenButacas: StoreApi['crearOrdenButacas'] = useCallback(
    ({ eventoId, asientoIds, compradorNombre, compradorEmail, codigoDescuento }) => {
      let resultado: ReturnType<StoreApi['crearOrdenButacas']> = null
      setState((s) => {
        const itemsExp: OrdenItem[] = []
        for (const aid of asientoIds) {
          const asiento = s.asientos.find((a) => a.id === aid)
          if (!asiento || (asiento.estado !== 'reservado' && asiento.estado !== 'disponible')) {
            return s
          }
          const sector = s.sectores.find((x) => x.id === asiento.sectorId)!
          itemsExp.push({
            asientoId: aid,
            descripcion: `${sector.nombre} · Fila ${asiento.fila} · Asiento ${asiento.numero}`,
            precio: sector.precio,
          })
        }
        const { orden, entradas, boleta } = _crearOrdenComun(
          s,
          eventoId,
          itemsExp,
          compradorNombre,
          compradorEmail,
          codigoDescuento,
        )
        const asientos = s.asientos.map((a) =>
          asientoIds.includes(a.id)
            ? { ...a, estado: 'vendido' as const, reservadoHasta: undefined }
            : a,
        )
        const codigos = orden.codigoDescuento
          ? s.codigos.map((c) =>
              c.codigo === orden.codigoDescuento
                ? { ...c, usos: c.usos + 1 }
                : c,
            )
          : s.codigos
        resultado = { orden, entradas, boleta }
        return {
          ...s,
          asientos,
          codigos,
          ordenes: [...s.ordenes, orden],
          entradas: [...s.entradas, ...entradas],
          boletas: [...s.boletas, boleta],
          contadorBoleta: boleta.numero,
        }
      })
      return resultado
    },
    [setState],
  )

  const emitirCortesia: StoreApi['emitirCortesia'] = useCallback(
    ({ eventoId, nombre, email, descripcion }) => {
      const ordenId = uid('ord')
      const fecha = new Date().toISOString()
      const entrada: Entrada = {
        id: uid('ent'),
        ordenId,
        eventoId,
        codigoUnico: ticketCode(),
        descripcion: descripcion || 'Cortesía',
        titular: nombre,
        estado: 'valida',
        esCortesia: true,
      }
      const orden: Orden = {
        id: ordenId,
        eventoId,
        items: [{ descripcion: 'Cortesía', precio: 0 }],
        subtotal: 0,
        descuento: 0,
        cargoServicio: 0,
        total: 0,
        estado: 'pagada',
        compradorNombre: nombre,
        compradorEmail: email,
        fecha,
      }
      setState((s) => ({
        ...s,
        ordenes: [...s.ordenes, orden],
        entradas: [...s.entradas, entrada],
      }))
      return entrada
    },
    [setState],
  )

  const upsertCodigo = useCallback((c: CodigoDescuento) => {
    setState((s) => {
      const exists = s.codigos.find((x) => x.codigo === c.codigo)
      const codigos = exists
        ? s.codigos.map((x) => (x.codigo === c.codigo ? c : x))
        : [...s.codigos, c]
      return { ...s, codigos }
    })
  }, [setState])

  const removeCodigo = useCallback((codigo: string) => {
    setState((s) => ({
      ...s,
      codigos: s.codigos.filter((x) => x.codigo !== codigo),
    }))
  }, [setState])

  const validarEntrada: StoreApi['validarEntrada'] = useCallback(
    (codigoUnico) => {
      const cu = codigoUnico.trim().toUpperCase()
      const entrada = state.entradas.find(
        (e) => e.codigoUnico.toUpperCase() === cu,
      )
      if (!entrada) return { ok: false, motivo: 'no-existe' }
      if (entrada.estado === 'usada')
        return { ok: false, motivo: 'ya-usada', entrada }
      if (entrada.estado === 'anulada')
        return { ok: false, motivo: 'no-existe', entrada }
      // marcar como usada
      const usadaEn = new Date().toISOString()
      setState((s) => ({
        ...s,
        entradas: s.entradas.map((e) =>
          e.id === entrada.id ? { ...e, estado: 'usada', usadaEn } : e,
        ),
      }))
      const evento = state.eventos.find((e) => e.id === entrada.eventoId)
      return { ok: true, entrada: { ...entrada, estado: 'usada', usadaEn }, evento }
    },
    [setState, state.entradas, state.eventos],
  )

  const cancelarEvento = useCallback((eventoId: string, motivo: string) => {
    setState((s) => {
      const eventos = s.eventos.map((e) =>
        e.id === eventoId ? { ...e, estado: 'cancelado' as const } : e,
      )
      const ordenesEvento = s.ordenes.filter(
        (o) => o.eventoId === eventoId && o.estado === 'pagada',
      )
      const devoluciones: Devolucion[] = [
        ...s.devoluciones,
        ...ordenesEvento.map((o) => ({
          id: uid('dev'),
          ordenId: o.id,
          monto: o.total,
          fecha: new Date().toISOString(),
          motivo,
        })),
      ]
      const ordenes = s.ordenes.map((o) =>
        o.eventoId === eventoId && o.estado === 'pagada'
          ? { ...o, estado: 'reembolsada' as const }
          : o,
      )
      const entradas = s.entradas.map((e) =>
        e.eventoId === eventoId ? { ...e, estado: 'anulada' as const } : e,
      )
      return { ...s, eventos, ordenes, entradas, devoluciones }
    })
  }, [setState])

  const reembolsarOrden = useCallback((ordenId: string, motivo: string) => {
    setState((s) => {
      const orden = s.ordenes.find((o) => o.id === ordenId)
      if (!orden || orden.estado !== 'pagada') return s
      const ordenes = s.ordenes.map((o) =>
        o.id === ordenId ? { ...o, estado: 'reembolsada' as const } : o,
      )
      const entradas = s.entradas.map((e) =>
        e.ordenId === ordenId ? { ...e, estado: 'anulada' as const } : e,
      )
      const devoluciones: Devolucion[] = [
        ...s.devoluciones,
        {
          id: uid('dev'),
          ordenId,
          monto: orden.total,
          fecha: new Date().toISOString(),
          motivo,
        },
      ]
      // si era butacas, liberar asientos
      const asientoIds = orden.items
        .map((i) => i.asientoId)
        .filter((x): x is string => !!x)
      const asientos = s.asientos.map((a) =>
        asientoIds.includes(a.id)
          ? { ...a, estado: 'disponible' as const }
          : a,
      )
      // si era general, restar vendidas
      const tiposEntrada = s.tiposEntrada.map((t) => {
        const cant = orden.items.filter((i) => i.tipoEntradaId === t.id).length
        return cant > 0
          ? { ...t, vendidas: Math.max(0, t.vendidas - cant) }
          : t
      })
      return { ...s, ordenes, entradas, devoluciones, asientos, tiposEntrada }
    })
  }, [setState])

  const marcarLiquidacionPagada = useCallback((eventoId: string) => {
    setState((s) => {
      const existing = s.liquidaciones.find((l) => l.eventoId === eventoId)
      const fecha = new Date().toISOString()
      const liquidaciones: Liquidacion[] = existing
        ? s.liquidaciones.map((l) =>
            l.eventoId === eventoId ? { ...l, pagadaEn: fecha } : l,
          )
        : [...s.liquidaciones, { eventoId, pagadaEn: fecha }]
      return { ...s, liquidaciones }
    })
  }, [setState])

  const api = useMemo<StoreApi>(
    () => ({
      state,
      setState,
      reset,
      getEvento,
      getTiposEntradaByEvento,
      getSectoresByEvento,
      getAsientosBySector,
      getEntradasByOrden,
      getEntradasByEvento,
      getOrdenesByEvento,
      getBoletaByOrden,
      getCodigosByEvento,
      getCortesiasByEvento,
      upsertEvento,
      upsertTipoEntrada,
      removeTipoEntrada,
      upsertSector,
      removeSector,
      toggleAsientoBloqueado,
      reservarAsientos,
      liberarAsientos,
      marcarAsientosVendidos,
      crearOrdenGeneral,
      crearOrdenButacas,
      emitirCortesia,
      upsertCodigo,
      removeCodigo,
      validarCodigo,
      validarEntrada,
      cancelarEvento,
      reembolsarOrden,
      marcarLiquidacionPagada,
    }),
    [
      state,
      setState,
      reset,
      getEvento,
      getTiposEntradaByEvento,
      getSectoresByEvento,
      getAsientosBySector,
      getEntradasByOrden,
      getEntradasByEvento,
      getOrdenesByEvento,
      getBoletaByOrden,
      getCodigosByEvento,
      getCortesiasByEvento,
      upsertEvento,
      upsertTipoEntrada,
      removeTipoEntrada,
      upsertSector,
      removeSector,
      toggleAsientoBloqueado,
      reservarAsientos,
      liberarAsientos,
      marcarAsientosVendidos,
      crearOrdenGeneral,
      crearOrdenButacas,
      emitirCortesia,
      upsertCodigo,
      removeCodigo,
      validarCodigo,
      validarEntrada,
      cancelarEvento,
      reembolsarOrden,
      marcarLiquidacionPagada,
    ],
  )

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
