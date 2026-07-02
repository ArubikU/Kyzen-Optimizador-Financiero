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
