# 🎫 FacTickets

Sistema de gestión de tickets para eventos. Monorepo con frontend en React y backend en Spring Boot.

---

## 📁 Estructura del proyecto

```
FacTickets/
├── FacTickets/          # Frontend — React + Vite
│   ├── src/
│   ├── .env             ← variables de entorno del frontend
│   └── package.json
│
└── api/                 # Backend — Spring Boot + Java
    ├── backArquitectura/
    │   ├── src/
    │   ├── .env         ← variables de entorno del backend
    │   └── pom.xml
    └── docker-compose.yml
```

---

## 🛠️ Tecnologías requeridas

### Requisitos previos

| Herramienta | Versión mínima | Uso |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18+ | Frontend |
| [Java JDK](https://adoptium.net/) | 17 | Backend |
| [Maven](https://maven.apache.org/) | 3.8+ | Build del backend |
| [Docker](https://www.docker.com/) | 24+ | Contenedores (opcional) |
| [PostgreSQL](https://www.postgresql.org/) | 15+ | Base de datos |

---

## 🧩 Funcionamiento general

FacTickets es una plataforma que conecta tres tipos de usuarios para la organización y asistencia a eventos:

1. **El Propietario** registra un local/espacio disponible para eventos.
2. **El Organizador** crea un evento asociado a ese local y lo pone a la venta.
3. **El Cliente** compra tickets para el evento, recibe un QR y puede validarlo en la entrada.

El backend expone una API REST en el puerto `8080`. El frontend consume esa API y se comunica además mediante WebSockets (STOMP/SockJS) para notificaciones en tiempo real. Los pagos se procesan a través de Mercado Pago.

---

## 👥 Roles de usuario

### 🛍️ Cliente (`role: cliente`)
- Navega el catálogo de eventos disponibles.
- Compra tickets para eventos.
- Recibe un código QR por cada ticket adquirido.
- Puede ver el historial de sus tickets en su panel.

### 🏟️ Propietario de Local (`role: propietario`)
- Registra y administra los espacios/locales de su propiedad.
- Define la capacidad y características del local.
- Puede ver qué eventos se organizan en sus locales.

### 🎪 Organizador de Evento (`role: organizador`)
- Crea y gestiona eventos asociados a un local disponible.
- Define nombre, descripción, fechas y precio de los tickets.
- Puede validar los QR de los asistentes en la entrada del evento.
- Ve estadísticas de venta de su evento.

---

## 🖥️ Frontend — `FacTickets/`

### Stack
- **React 19** + **React Router 7**
- **Vite 7** (bundler)
- **TailwindCSS 4**
- **STOMP + SockJS** (WebSockets)
- **Mercado Pago SDK**

### Variables de entorno — `FacTickets/.env`

Crear el archivo `FacTickets/.env` (está ignorado por Git, no se sube al repositorio):

```env
# URL base del backend Spring Boot
VITE_API_BACKEND=http://localhost:8080

# Clave pública de Mercado Pago (modo test o producción)
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

> 💡 Se incluye `FacTickets/.env.example` como referencia con los nombres de las variables.

### Instalación y arranque

```bash
cd FacTickets

# Instalar dependencias
npm install

# Levantar servidor de desarrollo (http://localhost:5173)
npm run dev
```

### Otros comandos

```bash
npm run build      # Generar build de producción (carpeta dist/)
npm run preview    # Previsualizar el build de producción
npm run lint       # Revisar errores de código con ESLint
```

---

## ⚙️ Backend — `api/`

### Stack
- **Spring Boot 3.5** + **Java 17**
- **Spring Data JPA** + **Spring WebSocket**
- **PostgreSQL** (base de datos)
- **Lombok** · **ZXing** (generación de QR) · **Mercado Pago SDK**

### Variables de entorno — `api/backArquitectura/.env`

Crear el archivo `api/backArquitectura/.env` con los siguientes valores según el entorno:

```env
# ─── Base de datos ───────────────────────────────────────────────────────────
# Formato para ejecución local directa (mvn spring-boot:run):
DATABASE_URL=jdbc:postgresql://localhost:5432/nombre_de_la_bd

# Formato para ejecución con Docker (docker-compose --profile dev):
# DATABASE_URL=postgresql://testuser:testpass@postgres:5432/testdb

# Credenciales de la BD (solo para ejecución local directa)
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña

# ─── Servidor ────────────────────────────────────────────────────────────────
PORT=8080

# ─── CORS / Frontend ─────────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
FRONT_URI=http://localhost:5173

# ─── Mercado Pago ────────────────────────────────────────────────────────────
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

> ⚠️ El backend también hay un `.env` en `api/` (junto al `docker-compose.yml`) para cuando se levanta con Docker. Ver sección Docker abajo.

### Ejecución directa (sin Docker)

```bash
cd api/backArquitectura

# Con el wrapper de Maven incluido (no requiere Maven instalado globalmente)
./mvnw spring-boot:run          # Linux / Mac
mvnw.cmd spring-boot:run        # Windows

# O con Maven instalado globalmente
mvn spring-boot:run
```

El servidor queda disponible en `http://localhost:8080`.

---

## 🐳 Docker

El `docker-compose.yml` de `api/` define dos servicios:

| Servicio | Descripción | Puerto |
|---|---|---|
| `backend` | Aplicación Spring Boot | `8080` |
| `postgres` | PostgreSQL local (solo `--profile dev`) | `5433` |

> El servicio `postgres` usa el puerto externo **5433** (no 5432) para evitar conflicto con una instalación local de PostgreSQL en Windows.

### Variables de entorno para Docker — `api/.env`

```env
# Formato URI requerido por RenderDataSourceConfig (la URL incluye user:pass)
DATABASE_URL=postgresql://testuser:testpass@postgres:5432/testdb

PORT=8080
FRONTEND_URL=http://localhost:5173
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Comandos Docker

```bash
cd api

# Levantar backend + PostgreSQL local
docker-compose --profile dev up --build -d

# Levantar solo el backend (BD remota)
docker-compose up --build -d

# Ver logs del backend
docker logs backend-app -f

# Detener todo
docker-compose down

# Detener y borrar volumen de BD (¡elimina los datos!)
docker-compose down -v
```

---

## 🚀 Levantar el proyecto completo (desarrollo local)

```bash
# Terminal 1 — Backend
cd api/backArquitectura
mvn spring-boot:run

# Terminal 2 — Frontend
cd FacTickets
npm install
npm run dev
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |

---

## 📁 Archivos `.env` — resumen

| Archivo | Ignorado por Git | Para qué sirve |
|---|---|---|
| `FacTickets/.env` | ✅ Sí | URL del backend y clave pública de MP para el frontend |
| `api/backArquitectura/.env` | ✅ Sí | Conexión a BD, CORS y token privado de MP (ejecución directa) |
| `api/.env` | ✅ Sí | Variables para docker-compose (URL en formato URI) |
| `FacTickets/.env.example` | ❌ No (incluido en repo) | Referencia de variables para el frontend |
