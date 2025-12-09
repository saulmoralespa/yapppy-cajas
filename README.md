# 💳 Yappy Payment - QR Code Generator

Sistema de generación de códigos QR para pagos con Yappy implementado con **Clean Architecture** y **TypeScript**.

---

## 📑 Índice de Contenido

### 🚀 [Inicio Rápido](#-inicio-rápido)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecutar el Proyecto](#ejecutar-el-proyecto)

### 💻 [Desarrollo](#-desarrollo)
- [Modo Watch](#modo-watch-recomendado)
- [Compilación Manual](#compilación-manual)
- [Estructura de Archivos Generados](#estructura-de-archivos-generados)
- [Debugging](#debugging-con-node-inspector)

### 📋 [Características](#-características)
- [Funcionalidades Principales](#funcionalidades-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Seguridad](#-seguridad)

### 🏗️ [Arquitectura](#️-arquitectura)
- [Clean Architecture](#capas-de-clean-architecture)
- [Estructura del Proyecto](#capas-de-clean-architecture)
- [Patrones de Diseño](#-patrones-de-diseño-implementados)
- [Flujos de Operación](#-flujos-de-operación)

### 📖 [API Reference](#-api-endpoints)
- [Endpoints Disponibles](#-api-endpoints)
- [Documentación Swagger](#-documentación-api-swagger)

### 🚢 [Despliegue](#-despliegue)
- [Producción con PM2](#producción-con-pm2)
- [Variables de Entorno](#variables-de-entorno-en-producción)
- [Docker](#docker-opcional)

### 🧪 [Testing](#-testing)
- [Suite de Tests](#suite-de-tests-implementada)
- [Ejecutar Tests](#ejecutar-tests)
- [Cobertura](#cobertura-de-tests-por-componente)
- [Ejemplos](#ejemplo-test-de-validación-dto)

### 🛠️ [Otros](#️-otros)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Credenciales de Yappy** (Merchant ID, Secret Token, API Keys)

### Instalación

**1. Clonar el repositorio**
```bash
git clone <repository-url>
cd yappy2
```

**2. Instalar dependencias**
```bash
npm install
```

### Configuración

**3. Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de Yappy:
```env
# Yappy API Credentials
YAPPY_API_KEY=your_merchant_id
YAPPY_SECRET_KEY=your_secret_token_base64

# Device Configuration
YAPPY_ID_DEVICE=device-123
YAPPY_NAME_DEVICE=POS-Terminal
YAPPY_USER_DEVICE=user@merchant.com
YAPPY_ID_GROUP=group-456

# URLs
YAPPY_BASE_URL=https://api.yappy.com.pa
YAPPY_SANDBOX_BASE_URL=https://sandbox-api.yappy.com.pa

# Environment
YAPPY_SANDBOX=true
PORT=3000
```

### Ejecutar el Proyecto

**4. Compilar TypeScript**
```bash
npm run build
```

**5. Iniciar el servidor**
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

**Documentación Swagger:** `http://localhost:3000/api-docs`

---

## 💻 Desarrollo

### Modo Watch (Recomendado)

Para desarrollo con recarga automática:
```bash
npm run dev
```

Esto ejecuta `tsx watch src/app.ts` que:
- Compila TypeScript en memoria
- Reinicia el servidor automáticamente
- Muestra errores de compilación en tiempo real

### Compilación Manual

```bash
# Compilar una vez
npm run build

# Compilar y observar cambios
npm run watch
```

### Estructura de Archivos Generados

```
dist/                    # Archivos compilados (ignorados por git)
├── app.js
├── config/
├── domain/
├── infrastructure/
└── presentation/

data/sessions.json       # Sesiones persistidas (ignorado por git)
```

### Debugging con Node Inspector

```bash
# Modo debug
node --inspect dist/app.js

# Abrir Chrome DevTools
chrome://inspect
```

---

## 📋 Características

### Funcionalidades Principales

- ✅ **Clean Architecture** con separación clara de capas (Domain, Infrastructure, Presentation)
- ✅ **TypeScript** con modo estricto para type safety
- ✅ **Repository Pattern** para persistencia de sesiones en JSON
- ✅ **DTO Pattern** con validación exhaustiva de datos financieros
- ✅ **Reutilización de tokens** para optimizar llamadas a la API de Yappy
- ✅ **Generación de QR Code** dinámicos (DYN) e híbridos (HYB)
- ✅ **Consulta de estado** de transacciones en tiempo real
- ✅ **Cancelación de transacciones** pendientes
- ✅ **Cierre de cajas** con resumen de transacciones y montos
- ✅ **API REST** documentada con Swagger
- ✅ **Frontend moderno** con estructura organizada (CSS/JS externos)

### Tecnologías Utilizadas

#### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **TypeScript** | 5.9.3 | Lenguaje tipado |
| **Express** | 4.22.1 | Framework web |
| **Axios** | 1.13.2 | Cliente HTTP (Yappy API) |
| **env-var** | 7.5.0 | Validación de variables de entorno |
| **Swagger UI Express** | 5.0.1 | Documentación API interactiva |
| **YAML.js** | 0.3.0 | Parser para Swagger YAML |
| **dotenv** | 16.6.1 | Carga de .env |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing |

#### Frontend

| Tecnología | Propósito |
|------------|-----------|
| **QRCode.js** | Generación de códigos QR en canvas |
| **Vanilla JavaScript** | Sin frameworks adicionales |
| **CSS3** | Estilos con gradientes, flexbox, animaciones |
| **HTML5** | Semántico con accesibilidad |

#### DevDependencies

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| **tsx** | 4.21.0 | Ejecutor TypeScript (desarrollo) |
| **ts-node** | 10.9.2 | Ejecutor TypeScript (scripts) |
| **Vitest** | 1.6.1 | Framework de testing moderno |
| **@vitest/ui** | 1.6.1 | Interfaz web interactiva para tests |
| **@vitest/coverage-v8** | 1.6.1 | Reporte de cobertura de código |
| **@types/** | - | Definiciones de tipos TypeScript |

---

## 🏗️ Arquitectura

### Capas de Clean Architecture

```
src/
├── domain/                          # Lógica de negocio pura (independiente de frameworks)
│   ├── entities/                    # Entidades del dominio
│   │   └── session/          
│   │       ├── session.entity.ts          # Entidad base de sesión
│   │       └── device-session.entity.ts   # Sesión de dispositivo con token
│   │
│   ├── dtos/                        # Data Transfer Objects con validación
│   │   ├── session/
│   │   │   ├── open-device.dto.ts         # Validación para abrir dispositivo
│   │   │   └── close-device.dto.ts        # Validación para cerrar dispositivo
│   │   └── payment/
│   │       ├── generate-qrcode.dto.ts     # Validación de checkout (montos, cálculos)
│   │       ├── get-transaction.dto.ts     # Validación de transactionId (consulta)
│   │       └── cancel-transaction.dto.ts  # Validación de transactionId (cancelación)
│   │
│   ├── datasources/                 # Interfaces para fuentes de datos externas
│   │   ├── device.datasource.ts           # Contrato para gestión de dispositivos
│   │   └── payment.datasource.ts          # Contrato para operaciones de pago
│   │
│   ├── repositories/                # Interfaces para persistencia
│   │   └── session.repository.ts          # Contrato para almacenar sesiones
│   │
│   └── use-cases/                   # Casos de uso (lógica de aplicación)
│       ├── device/
│       │   ├── open-device.use-case.ts         # Abrir sesión y guardar token
│       │   └── close-device.use-case.ts        # Cerrar sesión y eliminar token
│       └── payment/
│           ├── generate-qrcode.use-case.ts     # Generar QR reutilizando token
│           ├── get-transaction.use-case.ts     # Consultar estado de transacción
│           └── cancel-transaction.use-case.ts  # Cancelar transacción pendiente
│
├── infrastructure/                  # Implementaciones concretas
│   ├── datasources/
│   │   ├── yappy-device.datasource.impl.ts    # Llamadas HTTP a Yappy (device)
│   │   └── yappy-payment.datasource.impl.ts   # Llamadas HTTP a Yappy (payment)
│   └── repositories/
│       └── json-session.repository.impl.ts    # Persistencia en sessions.json
│
├── presentation/                    # Capa de presentación (HTTP)
│   ├── api/
│   │   ├── controller.ts                      # Controladores HTTP (validación + use cases)
│   │   └── routes.ts                          # Rutas de la API
│   ├── server.ts                              # Configuración del servidor Express
│   └── routes.ts                              # Router principal
│
├── config/                          # Configuración
│   ├── envs.ts                               # Variables de entorno validadas
│   └── swagger.ts                            # Configuración Swagger
│
└── app.ts                           # Punto de entrada de la aplicación
```

### Frontend

```
public/
├── css/
│   └── styles.css                   # Estilos completos (gradientes, botones, estados)
├── js/
│   ├── qrcode.min.js               # Librería QRCode.js (standalone bundle)
│   └── app.js                      # Lógica de aplicación (fetch, UI, validación)
└── index.html                       # Página principal (HTML semántico)
```

### Patrones de Diseño Implementados

#### 1. **Repository Pattern**

Abstrae la persistencia de datos.

```typescript
// Interface (Domain)
interface SessionRepository {
  findAll(): Promise<SessionEntity[]>;
  save(session: SessionEntity): Promise<void>;
  deleteById(id: string): Promise<void>;
}

// Implementation (Infrastructure)
class JsonSessionRepositoryImpl implements SessionRepository {
  // Persiste en sessions.json
}
```

**Beneficios:**
- Cambiar de JSON a MongoDB sin tocar la lógica de negocio
- Testing con repositorios in-memory
- Separación clara de responsabilidades

---

#### 2. **DTO Pattern (Data Transfer Object)**

Valida datos en las fronteras del sistema.

```typescript
class GenerateQRCodeDto {
  static create(object: { [key: string]: any }): [string?, GenerateQRCodeDto?] {
    // Validaciones exhaustivas
    if (!sub_total || sub_total < 0) return ['sub_total must be >= 0'];
    
    // Validación de cálculo
    const calculatedTotal = sub_total + tax + tip - discount;
    if (Math.abs(calculatedTotal - total) > 0.01) {
      return [`Total calculation mismatch: expected ${calculatedTotal}`];
    }
    
    // Truncar description a 100 caracteres
    const trimmedDescription = description?.substring(0, 100);
    
    return [undefined, new GenerateQRCodeDto(...)];
  }
}
```

**Beneficios:**
- Validación centralizada y reutilizable
- Type safety con TypeScript
- Errores claros para el frontend

---

#### 3. **Use Case Pattern**

Encapsula la lógica de negocio.

```typescript
class GenerateQRCode {
  constructor(private readonly paymentDatasource: PaymentDatasource) {}
  
  async execute(dto: GenerateQRCodeDto): Promise<QRCodeResponse> {
    // Lógica de negocio pura
    // No sabe de HTTP, JSON, o bases de datos
    return await this.paymentDatasource.generateQRCode(dto);
  }
}
```

**Beneficios:**
- Lógica reutilizable (CLI, API, Workers)
- Testing aislado con mocks
- Single Responsibility Principle

---

#### 4. **Dependency Injection**

Inyección manual por constructor.

```typescript
// Ensamblaje en el Controller
const sessionRepository = new JsonSessionRepositoryImpl('./data');
const deviceDatasource = new YappyDeviceDatasourceImpl();
const paymentDatasource = new YappyPaymentDatasourceImpl(
  sessionRepository,
  deviceDatasource
);

const generateQRCodeUseCase = new GenerateQRCode(paymentDatasource);
const getTransactionUseCase = new GetTransaction(paymentDatasource);
const cancelTransactionUseCase = new CancelTransaction(paymentDatasource);
```

**Beneficios:**
- Facilita testing con mocks
- Bajo acoplamiento
- Facilita cambio de implementaciones

---

#### 5. **Datasource Pattern**

Abstrae fuentes de datos externas (APIs, DBs).

```typescript
// Interface (Domain)
abstract class PaymentDatasource {
  abstract generateQRCode(dto: GenerateQRCodeDto): Promise<QRCodeResponse>;
  abstract getTransaction(dto: GetTransactionDto): Promise<TransactionResponse>;
  abstract cancelTransaction(dto: CancelTransactionDto): Promise<CancelResponse>;
}

// Implementation (Infrastructure)
class YappyPaymentDatasourceImpl implements PaymentDatasource {
  async generateQRCode(dto: GenerateQRCodeDto) {
    // Llamadas HTTP a Yappy API
  }
}
```

**Beneficios:**
- Cambiar de Yappy a otro proveedor sin tocar el dominio
- Mocking fácil para testing
- Configuración centralizada (headers, base URLs)

### Flujos de Operación

#### Flujo 1: Generación de QR Code

```
┌─────────────┐
│   Usuario   │
│  (Frontend) │
└──────┬──────┘
       │ 1. Ingresa datos del pago
       │    (subtotal, tax, tip, discount)
       │
       ▼
┌──────────────────┐
│  calculateTotal()│ 2. Auto-calcula total
│   (JavaScript)   │
└────────┬─────────┘
         │
         │ 3. POST /api/generate-qrcode/DYN
         │
         ▼
┌─────────────────────┐
│   Controller        │ 4. Valida con GenerateQRCodeDto
│  (Presentation)     │
└──────────┬──────────┘
           │
           │ 5. Execute Use Case
           │
           ▼
┌─────────────────────────┐
│ GenerateQRCode UseCase  │ 6. Orquesta lógica
│      (Domain)           │
└──────────┬──────────────┘
           │
           │ 7. Call datasource
           │
           ▼
┌─────────────────────────────┐
│ YappyPaymentDatasourceImpl  │ 8. Verifica token en sessions.json
│     (Infrastructure)        │    ├─ Si existe: reutiliza
└──────────┬──────────────────┘    └─ Si no: openDevice() y guarda
           │
           │ 9. POST /qr/generate/{type}
           │    Headers: authorization, api-key, secret-key
           │
           ▼
┌─────────────────┐
│   Yappy API     │ 10. Retorna { hash, transactionId, date }
└────────┬────────┘
         │
         │ 11. Response { qrCodeUrl, transactionId, amount }
         │
         ▼
┌─────────────────┐
│   Frontend      │ 12. QRCode.toCanvas(hash)
│  (JavaScript)   │     Genera imagen del QR
└─────────────────┘
```

#### Flujo 2: Consulta de Estado

```
Usuario hace clic en "🔍 Consultar Estado"
         │
         ▼
GET /api/transaction/{transactionId}
         │
         ▼
Controller → GetTransaction UseCase
         │
         ▼
YappyPaymentDatasourceImpl
         │
         ▼
GET /qr/status/{transactionId} (Yappy API)
         │
         ▼
Actualiza UI con estado:
  ✅ COMPLETED → Verde
  ❌ CANCELLED → Rojo
  💳 PENDING → Amarillo
  ℹ️ Otros → Azul
```

#### Flujo 3: Cancelación de Transacción

```
Usuario hace clic en "❌ Cancelar Transacción"
         │
         ▼
Confirmación: "¿Estás seguro?"
         │
         ▼
PUT /api/transaction/{transactionId}
         │
         ▼
Controller → CancelTransaction UseCase
         │
         ▼
YappyPaymentDatasourceImpl
         │
         ▼
POST /qr/cancel/{transactionId} (Yappy API)
         │
         ▼
Actualiza UI:
  - Deshabilita botón "Cancelar"
  - Cambia estado a "Cancelada"
  - Muestra mensaje de confirmación
```

#### Flujo 4: Cierre de Cajas

```
Usuario hace clic en "🏪 Cerrar Cajas"
         │
         ▼
Confirmación: "¿Estás seguro?"
         │
         ▼
DELETE /api/close-device
         │
         ▼
Controller obtiene última sesión activa
         │
         ▼
CloseDevice UseCase
  ├─ Busca sesión por ID
  ├─ Valida que existe
  ├─ Cierra en Yappy API
  └─ Elimina del repository
         │
         ▼
DELETE /session/device (Yappy API)
         │
         ▼
Retorna resumen:
  - Número de transacciones
  - Monto total procesado
         │
         ▼
Muestra Modal con resumen:
  📊 Total de Transacciones: 15
  💰 Monto Total: $1,234.56
  ✅ Cajas cerradas exitosamente
```

### Persistencia de Datos

#### sessions.json

El sistema almacena las sesiones de dispositivo en formato JSON:

```json
[
  {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "createdAt": 1733673600000,
    "expiresIn": 21600
  }
]
```

**Ubicación:** `./data/sessions.json`

**Estructura:**
- `sessionId`: UUID único de la sesión
- `token`: Token JWT retornado por Yappy
- `createdAt`: Timestamp Unix en milisegundos
- `expiresIn`: Duración en segundos (21600 = 6 horas)

**Estrategia de reutilización:**
- Se usa el **último token** del array (`sessions[sessions.length - 1]`)
- Solo se reutilizan tokens NO expirados (`Date.now() < createdAt + expiresIn * 1000`)
- Si no hay tokens válidos, se crea uno nuevo con `openDevice()`
- Los tokens se persisten para evitar múltiples llamadas a Yappy

**Estrategia de expiración:**
- Sistema basado en timestamps Unix (evita problemas de zona horaria)
- Validación: `Date.now() >= (createdAt + expiresIn * 1000)`
- Sesiones expiradas se filtran automáticamente
- Duración predeterminada: 6 horas (21600 segundos)

**Migración futura:**
Cambiar de JSON a Redis/MongoDB solo requiere:
1. Crear nueva implementación de `SessionRepository`
2. Cambiar la inyección en el Controller
3. ¡La lógica de negocio no se toca! 🎉

### Frontend Features

#### Botón "Cerrar Cajas"

Posicionado fuera del contenedor principal para fácil acceso:

```javascript
// Botón flotante con confirmación
document.getElementById('closeRegisterBtn').addEventListener('click', async function() {
  if (!confirm('¿Estás seguro de que deseas cerrar las cajas?')) {
    return;
  }
  
  const response = await fetch('/api/close-device', { method: 'DELETE' });
  const data = await response.json();
  
  // Muestra modal con resumen
  document.getElementById('summaryTransactions').textContent = data.data.transactions;
  document.getElementById('summaryAmount').textContent = data.data.amount.toFixed(2);
  document.getElementById('closeSummaryModal').style.display = 'flex';
});
```

**Características:**
- 🏪 Botón flotante en esquina superior derecha
- ⚠️ Confirmación antes de cerrar
- 📊 Modal con resumen (transacciones + monto total)
- ✅ Indicador visual de éxito
- 🎨 Animaciones suaves (fadeIn, slideUp)

#### Auto-Cálculo de Total

```javascript
// Listeners en todos los inputs monetarios
['subTotal', 'tax', 'tip', 'discount'].forEach(id => {
  document.getElementById(id).addEventListener('input', calculateTotal);
});

function calculateTotal() {
  const total = subTotal + tax + tip - discount;
  document.getElementById('total').value = total.toFixed(2);
}
```

#### Estados Visuales de Transacción

| Estado | Color | Icono |
|--------|-------|-------|
| **PENDING** | Amarillo (#ffc107) | 💳 |
| **COMPLETED** | Verde (#28a745) | ✅ |
| **CANCELLED** | Rojo (#dc3545) | ❌ |
| **Otros** | Azul (#17a2b8) | ℹ️ |

#### Manejo de Errores

```javascript
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

// Errores de red capturados
try {
  const response = await fetch('/api/...');
  // ...
} catch (error) {
  showError('Error de conexión: ' + error.message);
}
```

---

## 📖 API Endpoints

### 1. Abrir Sesión de Dispositivo

**POST** `/api/open-device`

Crea una nueva sesión de dispositivo con Yappy y almacena el token.

**Request Body:**
```json
{
  "merchant_id": "string",
  "secret_key": "string"
}
```

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "deviceId": "device-123",
    "expiresAt": "2025-12-08T12:00:00Z"
  }
}
```

**Response 400 (Validation Error):**
```json
{
  "ok": false,
  "error": "merchant_id is required"
}
```

---

### 2. Cerrar Sesión de Dispositivo

**DELETE** `/api/close-device`

Cierra una sesión de dispositivo existente y retorna un resumen de las transacciones procesadas.

**Request Body (Opcional):**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Nota:** Si no se proporciona `sessionId`, el sistema cerrará automáticamente la última sesión activa.

**Response 200:**
```json
{
  "ok": true,
  "message": "Device session closed successfully",
  "data": {
    "transactions": 15,
    "amount": 1234.56
  }
}
```

**Response 404:**
```json
{
  "ok": false,
  "error": "No hay sesiones activas para cerrar"
}
```

---

### 3. Generar Código QR

**POST** `/api/generate-qrcode/:type`

Genera un código QR para pago. El tipo puede ser:
- `DYN` - Dinámico (monto variable)
- `HYB` - Híbrido (monto fijo con opciones)

**URL Parameters:**
- `type` - Tipo de QR (`DYN` o `HYB`)

**Request Body:**
```json
{
  "sub_total": 10.00,
  "tax": 0.70,
  "tip": 1.00,
  "discount": 0.00,
  "total": 11.70,
  "order_id": "ORD-12345",
  "description": "Compra de productos"
}
```

**Validaciones:**
- Todos los valores monetarios deben ser ≥ 0
- La fórmula `total = sub_total + tax + tip - discount` debe cumplirse con precisión
- `description` se trunca automáticamente a 100 caracteres
- `order_id` es opcional
- `description` es opcional

**Response 200:**
```json
{
  "ok": true,
  "message": "QR Code generated successfully",
  "data": {
    "qrCodeUrl": "QRCODE_HASH_STRING",
    "transactionId": "TXN-123456789",
    "amount": 11.70,
    "orderId": "ORD-12345",
    "type": "DYN",
    "expiresAt": "2025-12-08T12:30:00Z"
  }
}
```

**Response 400 (Validation Error):**
```json
{
  "ok": false,
  "error": "Total calculation mismatch: expected 11.70 but got 11.50"
}
```

---

### 4. Consultar Estado de Transacción

**GET** `/api/transaction/:transactionId`

Consulta el estado actual de una transacción.

**URL Parameters:**
- `transactionId` - ID de la transacción

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "transactionId": "TXN-123456789",
    "status": "COMPLETED",
    "amount": 11.70,
    "createdAt": "2025-12-08T10:00:00Z",
    "completedAt": "2025-12-08T10:05:30Z"
  }
}
```

**Estados posibles:**
- `PENDING` - Esperando pago
- `COMPLETED` / `SUCCESS` - Pago completado
- `CANCELLED` / `CANCELED` - Transacción cancelada
- `FAILED` - Pago fallido
- `EXPIRED` - QR expirado

**Response 400:**
```json
{
  "ok": false,
  "error": "transactionId must be at least 10 characters"
}
```

---

### 5. Cancelar Transacción

**PUT** `/api/transaction/:transactionId`

Cancela una transacción pendiente.

**URL Parameters:**
- `transactionId` - ID de la transacción a cancelar

**Response 200:**
```json
{
  "ok": true,
  "message": "Transaction cancelled successfully",
  "data": {
    "transactionId": "TXN-123456789",
    "status": "CANCELLED"
  }
}
```

**Response 400:**
```json
{
  "ok": false,
  "error": "Cannot cancel a completed transaction"
}
```

---

## 📖 API Endpoints

### 1. Abrir Sesión de Dispositivo

```
┌─────────────┐
│   Usuario   │
│  (Frontend) │
└──────┬──────┘
       │ 1. Ingresa datos del pago
       │    (subtotal, tax, tip, discount)
       │
       ▼
┌──────────────────┐
│  calculateTotal()│ 2. Auto-calcula total
│   (JavaScript)   │
└────────┬─────────┘
         │
         │ 3. POST /api/generate-qrcode/DYN
         │
         ▼
┌─────────────────────┐
│   Controller        │ 4. Valida con GenerateQRCodeDto
│  (Presentation)     │
└──────────┬──────────┘
           │
           │ 5. Execute Use Case
           │
           ▼
┌─────────────────────────┐
│ GenerateQRCode UseCase  │ 6. Orquesta lógica
│      (Domain)           │
└──────────┬──────────────┘
           │
           │ 7. Call datasource
           │
           ▼
┌─────────────────────────────┐
│ YappyPaymentDatasourceImpl  │ 8. Verifica token en sessions.json
│     (Infrastructure)        │    ├─ Si existe: reutiliza
└──────────┬──────────────────┘    └─ Si no: openDevice() y guarda
           │
           │ 9. POST /qr/generate/{type}
           │    Headers: authorization, api-key, secret-key
           │
           ▼
┌─────────────────┐
│   Yappy API     │ 10. Retorna { hash, transactionId, date }
└────────┬────────┘
         │
         │ 11. Response { qrCodeUrl, transactionId, amount }
         │
         ▼
┌─────────────────┐
│   Frontend      │ 12. QRCode.toCanvas(hash)
│  (JavaScript)   │     Genera imagen del QR
└─────────────────┘
```

### Flujo 2: Consulta de Estado

```
Usuario hace clic en "🔍 Consultar Estado"
         │
         ▼
GET /api/transaction/{transactionId}
         │
         ▼
Controller → GetTransaction UseCase
         │
         ▼
YappyPaymentDatasourceImpl
         │
         ▼
GET /qr/status/{transactionId} (Yappy API)
         │
         ▼
Actualiza UI con estado:
  ✅ COMPLETED → Verde
  ❌ CANCELLED → Rojo
  💳 PENDING → Amarillo
  ℹ️ Otros → Azul
```

### Flujo 3: Cancelación de Transacción

```
Usuario hace clic en "❌ Cancelar Transacción"
         │
         ▼
Confirmación: "¿Estás seguro?"
         │
         ▼
PUT /api/transaction/{transactionId}
         │
         ▼
Controller → CancelTransaction UseCase
         │
         ▼
YappyPaymentDatasourceImpl
         │
         ▼
POST /qr/cancel/{transactionId} (Yappy API)
         │
         ▼
Actualiza UI:
  - Deshabilita botón "Cancelar"
  - Cambia estado a "Cancelada"
  - Muestra mensaje de confirmación
```

---

## 🎨 Patrones de Diseño Implementados

### 1. **Repository Pattern**

Abstrae la persistencia de datos.

```typescript
// Interface (Domain)
interface SessionRepository {
  findAll(): Promise<SessionEntity[]>;
  save(session: SessionEntity): Promise<void>;
  deleteById(id: string): Promise<void>;
}

// Implementation (Infrastructure)
class JsonSessionRepositoryImpl implements SessionRepository {
  // Persiste en sessions.json
}
```

**Beneficios:**
- Cambiar de JSON a MongoDB sin tocar la lógica de negocio
- Testing con repositorios in-memory
- Separación clara de responsabilidades

---

### 2. **DTO Pattern (Data Transfer Object)**

Valida datos en las fronteras del sistema.

```typescript
class GenerateQRCodeDto {
  static create(object: { [key: string]: any }): [string?, GenerateQRCodeDto?] {
    // Validaciones exhaustivas
    if (!sub_total || sub_total < 0) return ['sub_total must be >= 0'];
    
    // Validación de cálculo
    const calculatedTotal = sub_total + tax + tip - discount;
    if (Math.abs(calculatedTotal - total) > 0.01) {
      return [`Total calculation mismatch: expected ${calculatedTotal}`];
    }
    
    // Truncar description a 100 caracteres
    const trimmedDescription = description?.substring(0, 100);
    
    return [undefined, new GenerateQRCodeDto(...)];
  }
}
```

**Beneficios:**
- Validación centralizada y reutilizable
- Type safety con TypeScript
- Errores claros para el frontend

---

### 3. **Use Case Pattern**

Encapsula la lógica de negocio.

```typescript
class GenerateQRCode {
  constructor(private readonly paymentDatasource: PaymentDatasource) {}
  
  async execute(dto: GenerateQRCodeDto): Promise<QRCodeResponse> {
    // Lógica de negocio pura
    // No sabe de HTTP, JSON, o bases de datos
    return await this.paymentDatasource.generateQRCode(dto);
  }
}
```

**Beneficios:**
- Lógica reutilizable (CLI, API, Workers)
- Testing aislado con mocks
- Single Responsibility Principle

---

### 4. **Dependency Injection**

Inyección manual por constructor.

```typescript
// Ensamblaje en el Controller
const sessionRepository = new JsonSessionRepositoryImpl('./data');
const deviceDatasource = new YappyDeviceDatasourceImpl();
const paymentDatasource = new YappyPaymentDatasourceImpl(
  sessionRepository,
  deviceDatasource
);

const generateQRCodeUseCase = new GenerateQRCode(paymentDatasource);
const getTransactionUseCase = new GetTransaction(paymentDatasource);
const cancelTransactionUseCase = new CancelTransaction(paymentDatasource);
```

**Beneficios:**
- Facilita testing con mocks
- Bajo acoplamiento
- Facilita cambio de implementaciones

---

### 5. **Datasource Pattern**

Abstrae fuentes de datos externas (APIs, DBs).

```typescript
// Interface (Domain)
abstract class PaymentDatasource {
  abstract generateQRCode(dto: GenerateQRCodeDto): Promise<QRCodeResponse>;
  abstract getTransaction(dto: GetTransactionDto): Promise<TransactionResponse>;
  abstract cancelTransaction(dto: CancelTransactionDto): Promise<CancelResponse>;
}

// Implementation (Infrastructure)
class YappyPaymentDatasourceImpl implements PaymentDatasource {
  async generateQRCode(dto: GenerateQRCodeDto) {
    // Llamadas HTTP a Yappy API
  }
}
```

**Beneficios:**
- Cambiar de Yappy a otro proveedor sin tocar el dominio
- Mocking fácil para testing
- Configuración centralizada (headers, base URLs)

---

## 🔒 Seguridad

### Validaciones Implementadas

✅ **TypeScript Strict Mode** - Validación de tipos en tiempo de compilación  
✅ **DTO Validation** - Validación exhaustiva en boundaries  
✅ **env-var** - Variables de entorno validadas y tipadas  
✅ **Input Sanitization** - Truncado de strings, validación de rangos  
✅ **Error Handling** - Try-catch en todos los endpoints  
✅ **No Credential Exposure** - Secrets en `.env`, nunca en código

### Variables de Entorno Requeridas

```env
# ⚠️ NUNCA commitear el archivo .env
# Usar .env.example como plantilla

YAPPY_API_KEY=required
YAPPY_SECRET_KEY=required
YAPPY_ID_DEVICE=required
YAPPY_NAME_DEVICE=required
YAPPY_USER_DEVICE=required
YAPPY_ID_GROUP=required
```

---

## 🧪 Desarrollo

### Modo Watch (Recomendado)

Para desarrollo con recarga automática:
```bash
npm run dev
```

Esto ejecuta `tsx watch src/app.ts` que:
- Compila TypeScript en memoria
- Reinicia el servidor automáticamente
- Muestra errores de compilación en tiempo real

### Compilación Manual

```bash
# Compilar una vez
npm run build

# Compilar y observar cambios
npm run watch
```

### Estructura de Archivos Generados

```
dist/                    # Archivos compilados (ignorados por git)
├── app.js
├── config/
├── domain/
├── infrastructure/
└── presentation/

data/sessions.json       # Sesiones persistidas (ignorado por git)
```

---

## 📚 Documentación API (Swagger)

Accede a la documentación interactiva en:
```
http://localhost:3000/api-docs
```

**Características de Swagger UI:**
- Probar endpoints directamente desde el navegador
- Ver esquemas de request/response
- Ejemplos de payloads
- Códigos de respuesta HTTP

---

## 🛠️ Tecnologías

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **TypeScript** | 5.9.3 | Lenguaje tipado |
| **Express** | 4.22.1 | Framework web |
| **Axios** | 1.13.2 | Cliente HTTP (Yappy API) |
| **env-var** | 7.5.0 | Validación de variables de entorno |
| **Swagger UI Express** | 5.0.1 | Documentación API interactiva |
| **YAML.js** | 0.3.0 | Parser para Swagger YAML |
| **dotenv** | 16.6.1 | Carga de .env |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing |

### Frontend

| Tecnología | Propósito |
|------------|-----------|
| **QRCode.js** | Generación de códigos QR en canvas |
| **Vanilla JavaScript** | Sin frameworks adicionales |
| **CSS3** | Estilos con gradientes, flexbox, animaciones |
| **HTML5** | Semántico con accesibilidad |

### DevDependencies

| Herramienta | Propósito |
|-------------|-----------|
| **tsx** | Ejecutor TypeScript (desarrollo) |
| **ts-node** | Ejecutor TypeScript (scripts) |
| **@types/** | Definiciones de tipos |

---

## 📁 Persistencia

### sessions.json

El sistema almacena las sesiones de dispositivo en formato JSON:

```json
[
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "createdAt": "2025-12-08T10:00:00.000Z"
  }
]
```

**Ubicación:** `./data/sessions.json`

**Estrategia de reutilización:**
- Se usa el **último token** del array (`sessions[sessions.length - 1]`)
- Si no hay tokens, se crea uno nuevo con `openDevice()`
- Los tokens se persisten para evitar múltiples llamadas a Yappy

**Migración futura:**
Cambiar de JSON a Redis/MongoDB solo requiere:
1. Crear nueva implementación de `SessionRepository`
2. Cambiar la inyección en el Controller
3. ¡La lógica de negocio no se toca! 🎉

### Frontend Features

#### Auto-Cálculo de Total

```javascript
// Listeners en todos los inputs monetarios
['subTotal', 'tax', 'tip', 'discount'].forEach(id => {
  document.getElementById(id).addEventListener('input', calculateTotal);
});

function calculateTotal() {
  const total = subTotal + tax + tip - discount;
  document.getElementById('total').value = total.toFixed(2);
}
```

### Estados Visuales de Transacción

| Estado | Color | Icono |
|--------|-------|-------|
| **PENDING** | Amarillo (#ffc107) | 💳 |
| **COMPLETED** | Verde (#28a745) | ✅ |
| **CANCELLED** | Rojo (#dc3545) | ❌ |
| **Otros** | Azul (#17a2b8) | ℹ️ |

### Manejo de Errores

```javascript
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

// Errores de red capturados
try {
  const response = await fetch('/api/...');
  // ...
} catch (error) {
  showError('Error de conexión: ' + error.message);
}
```

---

## 🛠️ Otros

### 🐛 Troubleshooting

#### Puerto 3000 en uso

```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# O cambiar puerto en .env
PORT=3001
```

#### Error de compilación TypeScript

```bash
# Limpiar y recompilar
rm -rf dist/
npm run build

# Ver errores detallados
npx tsc --noEmit
```

#### QR no se genera

**Checklist:**
1. ✅ Verificar credenciales en `.env`
2. ✅ Confirmar `YAPPY_SANDBOX=true` para pruebas
3. ✅ Revisar logs del servidor: `npm start`
4. ✅ Validar que `sessions.json` exista en `./data/`
5. ✅ Verificar conectividad con Yappy API

```bash
# Test manual de conectividad
curl -X POST https://sandbox-api.yappy.com.pa/qr/generate/DYN \
  -H "authorization: YOUR_TOKEN" \
  -H "api-key: YOUR_API_KEY" \
  -H "secret-key: YOUR_SECRET_KEY"
```

#### Frontend no carga estilos

```bash
# Verificar estructura de archivos
ls -la public/
# Debe mostrar: css/, js/, index.html

ls -la public/css/
# Debe mostrar: styles.css

ls -la public/js/
# Debe mostrar: app.js, qrcode.min.js
```

#### Sesión expirada

```bash
# Eliminar sesiones antiguas
rm data/sessions.json

# Reiniciar servidor
npm start
```

### 🧪 Testing

#### Suite de Tests Implementada

✅ **161 tests unitarios** cubriendo toda la lógica de dominio

**Framework:** Vitest 1.6.1 con cobertura v8

#### Estructura de Tests

```
tests/
├── unit/
│   └── domain/
│       ├── dtos/
│       │   └── payment/
│       │       ├── get-transaction.dto.test.ts          (20 tests)
│       │       ├── cancel-transaction.dto.test.ts       (28 tests)
│       │       └── generate-qrcode.dto.test.ts          (47 tests)
│       ├── entities/
│       │   └── session/
│       │       └── device-session.entity.test.ts        (41 tests)
│       └── use-cases/
│           └── device/
│               └── close-device.use-case.test.ts        (25 tests)
```

#### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar con UI interactiva
npm run test:ui

# Generar reporte de cobertura
npm run test:coverage

# Ejecutar solo tests unitarios
npm run test:unit
```

#### Cobertura de Tests por Componente

| Componente | Tests | Cobertura |
|------------|-------|-----------|
| **GetTransactionDto** | 20 | Validaciones completas, tipos, contenido, casos edge |
| **CancelTransactionDto** | 28 | Validaciones + compatibilidad snake_case |
| **GenerateQRCodeDto** | 47 | ✨ **CRÍTICO** - Cálculos financieros, precisión, rangos |
| **DeviceSessionEntity** | 41 | ✨ **CRÍTICO** - Expiración de tokens, timestamps |
| **CloseDevice UseCase** | 25 | Mocks, flujo completo, manejo de errores |

#### Ejemplo: Test de Validación DTO

```typescript
describe('GenerateQRCodeDto', () => {
  test('should validate total calculation', () => {
    const [error] = GenerateQRCodeDto.create({
      sub_total: 10,
      tax: 1,
      tip: 0,
      discount: 0,
      total: 12  // ❌ Incorrecto (debería ser 11)
    });
    
    expect(error).toContain('Total calculation mismatch');
  });

  test('should handle floating point precision', () => {
    const [error, dto] = GenerateQRCodeDto.create({
      sub_total: 10.15,
      tax: 0.71,
      tip: 1.50,
      discount: 0.36,
      total: 12.00,  // 10.15 + 0.71 + 1.50 - 0.36 = 12.00
      type: 'DYN'
    });
    
    expect(error).toBeUndefined();
    expect(dto).toBeDefined();
  });
});
```

#### Ejemplo: Test de Entity

```typescript
describe('DeviceSessionEntity', () => {
  test('should detect expired sessions', () => {
    const oldTime = Date.now() - (7 * 60 * 60 * 1000); // 7 horas atrás
    const session = DeviceSessionEntity.fromStorage(
      'session-id',
      'token-123',
      oldTime,
      21600  // 6 horas de expiración
    );
    
    expect(session.isExpired()).toBe(true);
  });
});
```

#### Ejemplo: Test de Use Case con Mocks

```typescript
describe('CloseDevice UseCase', () => {
  test('should close device and delete session', async () => {
    // Arrange
    const session = DeviceSessionEntity.createNew('token-123');
    const [, dto] = CloseDeviceDto.create({ sessionId: session.sessionId });

    mockSessionRepository.findById.mockResolvedValue(session);
    mockDeviceDatasource.closeDevice.mockResolvedValue(undefined);
    mockSessionRepository.delete.mockResolvedValue(undefined);

    // Act
    await closeDeviceUseCase.execute(dto!);

    // Assert
    expect(mockSessionRepository.findById).toHaveBeenCalledWith(session.sessionId);
    expect(mockDeviceDatasource.closeDevice).toHaveBeenCalledWith('token-123');
    expect(mockSessionRepository.delete).toHaveBeenCalledWith(session.sessionId);
  });
});
```

#### Configuración de Vitest

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@presentation': path.resolve(__dirname, './src/presentation')
    }
  }
});
```

#### Patrones de Testing Implementados

✅ **AAA Pattern** (Arrange-Act-Assert)  
✅ **Mock Isolation** con `vi.clearAllMocks()` en `beforeEach`  
✅ **Edge Cases** (valores negativos, strings vacíos, timestamps = 0)  
✅ **Real-world Scenarios** (sesiones expiradas, errores de red, UUIDs)  
✅ **Error Propagation** (datasource, repository, validación)  
✅ **Call Order Verification** (ejecución secuencial correcta)

#### Próximos Tests a Implementar

- [ ] **GenerateQRCode UseCase** - Test de generación de QR con mocks
- [ ] **GetTransaction UseCase** - Test de consulta de estado
- [ ] **CancelTransaction UseCase** - Test de cancelación
- [ ] **JsonSessionRepository** - Tests de integración con filesystem
- [ ] **API Endpoints** - Tests de integración con supertest
- [ ] **E2E Tests** - Flujos completos de usuario

### 📊 Logs y Monitoring

#### Logs del Servidor

```bash
# Ver logs en tiempo real
npm start

# Output esperado:
Server running on port 3000
Swagger docs available at /api-docs
✓ Sessions loaded: 1
```

### 📚 Documentación API (Swagger)

Accede a la documentación interactiva en:
```
http://localhost:3000/api-docs
```

**Características de Swagger UI:**
- Probar endpoints directamente desde el navegador
- Ver esquemas de request/response
- Ejemplos de payloads
- Códigos de respuesta HTTP

#### Debugging con Node Inspector

```bash
# Modo debug
node --inspect dist/app.js

# Abrir Chrome DevTools
chrome://inspect
```

---

## 🚢 Despliegue

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Compilar
npm run build

# Iniciar con PM2
pm2 start dist/app.js --name yappy-payment

# Ver logs
pm2 logs yappy-payment

# Reiniciar
pm2 restart yappy-payment
```

### Variables de Entorno en Producción

```bash
# Establecer variables en el servidor
export YAPPY_SANDBOX=false
export YAPPY_BASE_URL=https://api.yappy.com.pa
export PORT=8080
```

### Docker (Opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
COPY public/ ./public/
EXPOSE 3000
CMD ["node", "dist/app.js"]
```

### 🔒 Seguridad

#### Validaciones Implementadas

✅ **TypeScript Strict Mode** - Validación de tipos en tiempo de compilación  
✅ **DTO Validation** - Validación exhaustiva en boundaries  
✅ **env-var** - Variables de entorno validadas y tipadas  
✅ **Input Sanitization** - Truncado de strings, validación de rangos  
✅ **Error Handling** - Try-catch en todos los endpoints  
✅ **No Credential Exposure** - Secrets en `.env`, nunca en código

#### Variables de Entorno Requeridas

```env
# ⚠️ NUNCA commitear el archivo .env
# Usar .env.example como plantilla

YAPPY_API_KEY=required
YAPPY_SECRET_KEY=required
YAPPY_ID_DEVICE=required
YAPPY_NAME_DEVICE=required
YAPPY_USER_DEVICE=required
YAPPY_ID_GROUP=required
```

---

## 🎯 Roadmap

### Versión 1.0 ✅ (Completado)

- ✅ Clean Architecture con TypeScript
- ✅ Generación de QR codes (DYN/HYB)
- ✅ Consulta y cancelación de transacciones
- ✅ Reutilización de tokens con expiración
- ✅ Frontend moderno con auto-cálculo
- ✅ **Testing unitario completo (161 tests)** ← **NUEVO**
- ✅ Documentación API con Swagger
- ✅ Repository Pattern con JSON

### Versión 1.1 (En Progreso)

- [x] **Tests de Domain Layer** (DTOs, Entities, Use Cases) ✅
- [ ] Tests de Use Cases restantes (GenerateQRCode, GetTransaction, CancelTransaction)
- [ ] Tests de integración (JsonSessionRepository)
- [ ] Tests de API (endpoints con supertest)
- [ ] CI/CD con GitHub Actions
- [ ] Cobertura de código ≥ 80%

### Versión 1.2 (Planeado)

- [ ] Webhook para notificaciones de pago
- [ ] Dashboard de transacciones
- [ ] Exportación a CSV/Excel
- [ ] Tests E2E con Playwright
- [ ] Dockerización completa
- [ ] Métricas con Prometheus

### Versión 2.0 (Futuro)

- [ ] Integración con otros gateways (Stripe, PayPal)
- [ ] Modo multi-tenant
- [ ] Autenticación OAuth2
- [ ] Rate limiting con Redis
- [ ] Caché con Redis
- [ ] GraphQL API
- [ ] WebSockets para estado en tiempo real

---

## 📝 Licencia

MIT

---

## 👥 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Código

- **TypeScript strict mode** habilitado
- **Clean Architecture** respetando las capas
- **Comentarios JSDoc** en clases y métodos públicos
- **Nombres descriptivos** en inglés (código) y español (UI)

---

## 📞 Soporte

---

**Desarrollado con ❤️ usando Clean Architecture y TypeScript**

*Última actualización: Diciembre 8, 2025*
