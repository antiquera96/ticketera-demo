# Pulse · Ticketera (maqueta demo)

Maqueta navegable de una plataforma de venta de entradas pensada para eventos de
100 a 1.000 personas en Chile. Es **solo frontend**: todos los datos son
simulados y se guardan en `localStorage`. Los pagos, boletas SII y
transferencias son simulados.

> Stack: React + Vite + TypeScript · TailwindCSS · React Router · `qrcode.react`
> · `recharts` · `lucide-react`. Tipografía Space Grotesk.

---

## Instalar y correr

```bash
npm install
npm run dev
```

La app abre automáticamente en `http://localhost:5173`.

Para compilar a producción:

```bash
npm run build
npm run preview
```

---

## Cómo recorrer la demo

En la barra superior hay un selector de rol siempre visible: **Comprador**,
**Productor**, **Control**. Cámbialo cuando quieras (no hay login real).
También tienes un botón **Reiniciar demo** para volver al seed original.

### 1) Rol **Comprador** — vender online + e-ticket con QR

1. `/` Catálogo — explora los 4 eventos demo (hay uno destacado).
2. Entra a un evento de **admisión general** (Neon Pulse, Indie Nights, Stand Up).
   - Suma entradas en la barra lateral. Ve cómo se calcula el cargo por servicio.
   - "Ir a pagar" → en checkout aplica el cupón **`PULSE20`** (Neon) o
     **`INDIE5K`** (Indie) y prueba **Simular pago exitoso** o **rechazado**.
   - Al éxito se genera la orden, los e-tickets con **QR único** y la **boleta
     electrónica simulada** (N° correlativo).
3. Entra al evento de **butacas numeradas** (Hamlet · Reinvención):
   - Elige asientos en el mapa. Los reservados quedan por **10 minutos**
     (cuenta regresiva en checkout). Si abandonas, se liberan solos.
4. `/mis-entradas` — todas las entradas con su QR.

### 2) Rol **Productor** — autoservicio completo

1. `/productor` Dashboard con tus eventos, vendidas vs. aforo y accesos
   rápidos por evento.
2. **Crear nuevo evento** → asistente en 3 pasos (Información, Entradas/Butacas,
   Publicación). Puedes guardar como borrador o publicar.
3. Si el evento es de butacas, entra a **Mapa** y diseña sectores
   (filas × columnas × precio). Haz clic en asientos para bloquear pasillos.
4. **Cortesías & códigos**: emite cortesías (entradas gratis con QR) y crea
   códigos de descuento por porcentaje o monto fijo. Verás cuántas veces se usó
   cada código.
5. **Reportes** en tiempo real: totales, gráfico de ventas por tipo/sector y
   ventas en el tiempo, tabla de detalle.
6. **Liquidación**: ingreso bruto − cargo por servicio (12%) = neto a transferir.
   Botón "Marcar como pagado".
7. **Boletas & devoluciones**: listado de boletas SII simuladas, devoluciones
   procesadas y un panel para reembolsar órdenes puntuales o **cancelar todo el
   evento** (reembolsos en cascada).

### 3) Rol **Control de Acceso** — validador de puerta

1. `/control` — elige el evento desde el selector superior.
2. Pega un código de entrada y pulsa **Validar**, o usa **Simular escaneo** para
   tomar una entrada válida cualquiera.
3. Resultados:
   - **VERDE** → "Acceso permitido" + datos del asistente (y se marca como Usada).
   - **ROJO** → "Entrada ya utilizada" si la repites.
   - **ROJO** → "Entrada no válida" si el código no existe.
4. Contador "Validadas: X de Y" y lista de asistentes ingresados. Indicador de
   **modo offline** (toda la lógica corre local).

---

## Datos de ejemplo (seed)

- **1 productor** ("Productora Demo")
- **4 eventos publicados** — 3 de admisión general y 1 con mapa de butacas.
- **Tipos de entrada** con uno casi agotado (Early Bird de Neon Pulse) y otro
  agotado (VIP casi al tope).
- **2 códigos de descuento** activos: `PULSE20` (-20%) y `INDIE5K` (-$5.000).
- ~300 órdenes y entradas pagadas previas para que los reportes y la
  liquidación se vean con datos desde el inicio.

Usa el botón **"Reiniciar demo"** del menú para volver al seed.

---

## Estructura

```
src/
  components/        Layout, RoleSwitcher, EventCard, TicketCard, SeatMap, …
  context/           StoreContext (mutaciones), RoleContext (selector de rol)
  data/              seed.ts (datos demo) + storage.ts (localStorage)
  pages/
    buyer/           Catalog, EventDetail, SeatSelection, Checkout,
                     Confirmation, MyTickets
    producer/        Dashboard, EventEditor, SeatMapEditor,
                     CompsAndDiscounts, Reports, Settlement,
                     InvoicesAndRefunds
    access/          Validator
  types/             Modelo de datos
  utils/             format.ts (CLP, fechas), id.ts
  index.css          Tailwind + sistema de diseño (azul eléctrico)
```

---

## Las 11 funciones y dónde verlas

| #   | Función                          | Dónde verla                                              |
| --- | -------------------------------- | -------------------------------------------------------- |
| 1   | Panel del productor              | `/productor`                                             |
| 2   | Venta online (web + móvil)       | `/` (responsive desde 375px)                             |
| 3   | Pasarela de pago simulada        | Botón "Ir a pagar" en cualquier evento                   |
| 4   | E-ticket con QR único            | `/confirmacion/:ordenId` y `/mis-entradas`               |
| 5   | App de control de acceso         | `/control`                                               |
| 6   | Gestión de aforo e inventario    | Tarjetas del catálogo (Agotado) y reportes               |
| 7   | Cortesías y códigos de descuento | `/productor/eventos/:id/cortesias`                       |
| 8   | Reportes en tiempo real          | `/productor/eventos/:id/reportes`                        |
| 9   | Liquidación y pago al productor  | `/productor/eventos/:id/liquidacion`                     |
| 10  | Boletas SII + devoluciones       | `/productor/eventos/:id/boletas` y confirmación de compra |
| 11  | Editor de mapa de recinto        | `/productor/eventos/:id/mapa` y selección por sectores    |

---

## Fuera de alcance

No hay backend, base de datos real, integración real de pagos, integración real
SII, envío real de mails, login real, multi-idioma, ni app móvil nativa.
