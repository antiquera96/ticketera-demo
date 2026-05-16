import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Catalog from './pages/buyer/Catalog'
import EventDetail from './pages/buyer/EventDetail'
import SeatSelection from './pages/buyer/SeatSelection'
import Checkout from './pages/buyer/Checkout'
import Confirmation from './pages/buyer/Confirmation'
import MyTickets from './pages/buyer/MyTickets'
import Dashboard from './pages/producer/Dashboard'
import EventEditor from './pages/producer/EventEditor'
import SeatMapEditor from './pages/producer/SeatMapEditor'
import CompsAndDiscounts from './pages/producer/CompsAndDiscounts'
import Reports from './pages/producer/Reports'
import Settlement from './pages/producer/Settlement'
import InvoicesAndRefunds from './pages/producer/InvoicesAndRefunds'
import Validator from './pages/access/Validator'

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Comprador */}
        <Route path="/" element={<Catalog />} />
        <Route path="/eventos/:id" element={<EventDetail />} />
        <Route path="/eventos/:id/butacas" element={<SeatSelection />} />
        <Route path="/checkout/:eventoId" element={<Checkout />} />
        <Route path="/confirmacion/:ordenId" element={<Confirmation />} />
        <Route path="/mis-entradas" element={<MyTickets />} />

        {/* Productor */}
        <Route path="/productor" element={<Dashboard />} />
        <Route path="/productor/eventos/nuevo" element={<EventEditor />} />
        <Route path="/productor/eventos/:id/editar" element={<EventEditor />} />
        <Route
          path="/productor/eventos/:id/mapa"
          element={<SeatMapEditor />}
        />
        <Route
          path="/productor/eventos/:id/cortesias"
          element={<CompsAndDiscounts />}
        />
        <Route path="/productor/eventos/:id/reportes" element={<Reports />} />
        <Route
          path="/productor/eventos/:id/liquidacion"
          element={<Settlement />}
        />
        <Route
          path="/productor/eventos/:id/boletas"
          element={<InvoicesAndRefunds />}
        />

        {/* Control de acceso */}
        <Route path="/control" element={<Validator />} />
        <Route path="/control/:eventoId" element={<Validator />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
