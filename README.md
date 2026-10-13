# Kyzen - Plataforma Web de Optimización Financiera 🇵🇪

Kyzen es un ecosistema inteligente e intuitivo diseñado específicamente para acompañar a los jóvenes universitarios y recién egresados en la gestión eficiente de sus finanzas personales. La plataforma centraliza el control de ingresos y egresos, ayudando a mitigar el impacto de la volatilidad económica local mediante un panel analítico y un motor integrado de recomendaciones financieras para reducir gastos hormiga y alcanzar metas de ahorro.

Este repositorio contiene el entorno de desarrollo y pruebas locales para el sistema completo (Frontend y Backend Core).

## Arquitectura del Entorno Local

El entorno local funciona al 100% en aislamiento (localhost) sin dependencias de infraestructura cloud externas, lo que permite un desarrollo ágil y pruebas ilimitadas de la lógica de negocio sin consumo de cuotas.

* **Capa de Presentación:** Single Page Application (SPA) construida en React / Next.js.
* **Capa de Negocio y Analítica:** Servidor REST API en Node.js (Express) que integra directamente el motor de reglas para el Score de Salud Financiera y la generación de recomendaciones.
* **Capa de Datos:** Persistencia relacional local sobre el motor PostgreSQL.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React.js, Next.js (Routing/Estáticos), CSS Avanzado.
* **Backend:** Node.js, Express.js.
* **Base de Datos:** PostgreSQL.
* **Control de Versiones:** Git & GitHub.

---

## Requisitos Previos

Antes de levantar el entorno local, asegúrate de tener instalado en tu estación de trabajo:

1.  **Node.js** (Versión v18 o superior recomendada)
2.  **PostgreSQL Server** (Corriendo localmente en el puerto `5432`)
3.  **Git**

---

## Configuración e Instalación Local

### 1. Clonar el Repositorio
```bash
git clone [https://github.com/tu-usuario-o-grupo/kyzen-local.git](https://github.com/tu-usuario-o-grupo/kyzen-local.git)
cd kyzen-local

---

## Funcionalidades según el documento del Grupo 6

| HU | Funcionalidad | Dónde |
|----|---------------|-------|
| HU-07 / HU-08 | Registro con correo válido y contraseña alfanumérica ≥ 8 caracteres; error de login genérico | `authController.js`, `utils/validators.js` |
| HU-01 | Monto > 0 y categoría obligatoria en gastos (el botón Guardar se deshabilita) | `transactionController.js`, `MovementsPage.jsx` |
| HU-03 | Comprobante JPG/PNG de máx. 5MB (`voucher: { mimeType, data }` en base64), servido en `/uploads` | `utils/voucherStorage.js` |
| HU-20 | Alerta roja si el gasto del mes supera el 80% del presupuesto (`PUT /api/auth/budget`) | `utils/alertEngine.js`, `dashboardController.js` |
| HU-12 | Dashboard con balance, gráfico por categoría y alerta reactiva | `dashboardController.js`, `DashboardPage.jsx` |
| HU-06 | Perfil, cambio de contraseña (`PUT /api/auth/change-password`) y presupuesto | `authController.js`, `ProfilePage.jsx` |
| Metas | CRUD de metas, `?currency=USD` recalcula montos y cuota mensual | `goalController.js`, `utils/currency.js` |
| Exportación | `GET /api/transactions/export?period=Mensual|Semanal|Anual` (CSV) y PDF desde el perfil | `utils/csvExport.js` |

### Pruebas unitarias (caja blanca)

```bash
cd Finalback-main/Finalback-main
npm test
```

### Variables de entorno

Copia `Finalback-main/Finalback-main/.env.example` a `.env`. Los códigos OTP de acceso rápido (`123456`, `111111`) ya **no** funcionan salvo que definas `ALLOW_DEV_OTP=true` en desarrollo; el OTP real se imprime en la consola del backend.
