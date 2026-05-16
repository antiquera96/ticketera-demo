import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Gift, Plus, Tag, Trash2 } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import PageHeader from '../../components/PageHeader'
import Modal from '../../components/Modal'
import TicketCard from '../../components/TicketCard'
import { formatCLP } from '../../utils/format'
import type { CodigoDescuento, TipoDescuento } from '../../types'

export default function CompsAndDiscounts() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    getEvento,
    getCortesiasByEvento,
    getCodigosByEvento,
    emitirCortesia,
    upsertCodigo,
    removeCodigo,
  } = useStore()

  const evento = getEvento(id!)
  if (!evento) return null

  const cortesias = getCortesiasByEvento(evento.id)
  const codigos = getCodigosByEvento(evento.id)

  const [openCortesia, setOpenCortesia] = useState(false)
  const [openCodigo, setOpenCodigo] = useState(false)
  const [cName, setCName] = useState('Invitado VIP')
  const [cEmail, setCEmail] = useState('invitado@example.com')
  const [cDesc, setCDesc] = useState('Cortesía · Acceso general')

  const [codigo, setCodigo] = useState('PROMO10')
  const [tipo, setTipo] = useState<TipoDescuento>('porcentaje')
  const [valor, setValor] = useState<number>(10)

  const [verEntradaId, setVerEntradaId] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <button
        onClick={() => navigate('/productor')}
        className="mb-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-electric-300"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al panel
      </button>

      <PageHeader
        eyebrow="Cortesías & códigos"
        title={evento.nombre}
        subtitle="Emite cortesías sin pasar por pago y crea códigos de descuento para tus compradores."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* CORTESIAS */}
        <section className="panel rounded-3xl">
          <div className="flex items-center justify-between border-b border-white/5 p-5">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-amber-400/15 p-2 text-amber-200">
                <Gift className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Cortesías
                </div>
                <div className="text-xs text-slate-500">
                  {cortesias.length} emitidas
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpenCortesia(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4" /> Emitir
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
            {cortesias.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                Aún no emitiste cortesías para este evento.
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {cortesias.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                  >
                    <div>
                      <div className="text-white">{c.titular}</div>
                      <div className="text-[11px] text-slate-500">
                        {c.descripcion}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <code className="font-mono text-xs text-electric-200">
                        {c.codigoUnico}
                      </code>
                      <button
                        onClick={() => setVerEntradaId(c.id)}
                        className="text-xs text-electric-300 hover:underline"
                      >
                        Ver QR
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* CODIGOS */}
        <section className="panel rounded-3xl">
          <div className="flex items-center justify-between border-b border-white/5 p-5">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-electric-400/15 p-2 text-electric-200">
                <Tag className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Códigos de descuento
                </div>
                <div className="text-xs text-slate-500">
                  {codigos.length} activos
                </div>
              </div>
            </div>
            <button onClick={() => setOpenCodigo(true)} className="btn-primary">
              <Plus className="h-4 w-4" /> Crear
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
            {codigos.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-slate-500">
                Aún no creaste códigos.
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {codigos.map((c) => (
                  <li
                    key={c.codigo}
                    className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                  >
                    <div>
                      <code className="font-mono text-base text-electric-200">
                        {c.codigo}
                      </code>
                      <div className="text-[11px] text-slate-500">
                        {c.tipo === 'porcentaje'
                          ? `-${c.valor}% sobre el subtotal`
                          : `-${formatCLP(c.valor)} fijo`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="chip">{c.usos} usos</span>
                      <button
                        onClick={() => removeCodigo(c.codigo)}
                        className="text-slate-500 hover:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* MODAL cortesia */}
      <Modal
        open={openCortesia}
        onClose={() => setOpenCortesia(false)}
        title="Emitir cortesía"
        size="sm"
      >
        <div className="space-y-3">
          <div>
            <label className="label">Nombre del invitado</label>
            <input
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              value={cEmail}
              onChange={(e) => setCEmail(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Descripción</label>
            <input
              value={cDesc}
              onChange={(e) => setCDesc(e.target.value)}
              className="input"
            />
          </div>
          <button
            onClick={() => {
              emitirCortesia({
                eventoId: evento.id,
                nombre: cName,
                email: cEmail,
                descripcion: cDesc,
              })
              setOpenCortesia(false)
            }}
            className="btn-primary w-full"
          >
            Generar entrada
          </button>
        </div>
      </Modal>

      {/* MODAL codigo */}
      <Modal
        open={openCodigo}
        onClose={() => setOpenCodigo(false)}
        title="Crear código de descuento"
        size="sm"
      >
        <div className="space-y-3">
          <div>
            <label className="label">Código</label>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              className="input font-mono uppercase"
            />
          </div>
          <div>
            <label className="label">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {(['porcentaje', 'monto'] as TipoDescuento[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={
                    'rounded-xl border px-3 py-2 text-sm capitalize ' +
                    (tipo === t
                      ? 'border-electric-400/50 bg-electric-400/10 text-electric-200'
                      : 'border-white/10 bg-white/5 text-slate-400')
                  }
                >
                  {t === 'porcentaje' ? 'Porcentaje %' : 'Monto fijo $'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">
              Valor {tipo === 'porcentaje' ? '(%)' : '(CLP)'}
            </label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(Number(e.target.value) || 0)}
              className="input"
            />
          </div>
          <button
            onClick={() => {
              const c: CodigoDescuento = {
                codigo,
                eventoId: evento.id,
                tipo,
                valor,
                usos: 0,
              }
              upsertCodigo(c)
              setOpenCodigo(false)
            }}
            className="btn-primary w-full"
          >
            Guardar código
          </button>
        </div>
      </Modal>

      <Modal
        open={!!verEntradaId}
        onClose={() => setVerEntradaId(null)}
        title="Cortesía emitida"
      >
        {(() => {
          const ent = cortesias.find((c) => c.id === verEntradaId)
          if (!ent) return null
          return <TicketCard entrada={ent} evento={evento} />
        })()}
      </Modal>
    </div>
  )
}
