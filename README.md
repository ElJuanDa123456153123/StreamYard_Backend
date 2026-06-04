# StreamYard Backend

Backend API para StreamYard Clone desarrollado con NestJS, TypeScript y PostgreSQL.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# Iniciar base de datos PostgreSQL
docker-compose up -d

# Modo desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

API estará disponible en: `http://localhost:3001/api/v1`

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── modules/           # Módulos de funcionalidad
│   │   ├── auth/         # Autenticación y autorización
│   │   ├── users/        # Gestión de usuarios
│   │   ├── streams/      # Gestión de streams
│   │   └── sessions/     # Sesiones de streaming
│   ├── common/           # Utilidades compartidas
│   │   ├── decorators/   # Decoradores personalizados
│   │   ├── guards/       # Guards de autenticación
│   │   ├── filters/      # Filtros de excepciones
│   │   ├── interceptors/ # Interceptors
│   │   └── pipes/       # Pipes de transformación
│   ├── config/          # Configuración
│   └── main.ts          # Punto de entrada
├── test/                # Tests
├── .env                 # Variables de entorno
├── docker-compose.yml   # PostgreSQL Docker
└── package.json
```

## 🔌 Endpoints Principales

### Autenticación `/auth`
- `POST /register` - Registro
- `POST /login` - Inicio de sesión
- `POST /refresh` - Refrescar token
- `GET /google` - OAuth Google
- `GET /google/callback` - Callback OAuth

### Usuarios `/users`
- `GET /profile` - Obtener perfil
- `PUT /profile` - Actualizar perfil

### Streams `/streams`
- `POST /` - Crear stream
- `GET /` - Listar streams
- `GET /public` - Streams públicos
- `GET /live` - Streams en vivo
- `GET /my` - Mis streams
- `GET /:id` - Detalle de stream
- `PUT /:id` - Actualizar stream
- `DELETE /:id` - Eliminar stream

### Sessions `/sessions`
- `POST /streams/:streamId` - Crear sesión
- `GET /stream/:streamId` - Participantes
- `POST /:id/join` - Unirse
- `POST /:id/leave` - Salir
- `POST /:id/kick` - Expulsar

## 🗄️ Base de Datos

### Entidades

**User**
```typescript
- id: uuid
- email: string (unique)
- name: string
- avatar: string (optional)
- role: enum (user, admin, moderator)
- googleId: string (optional)
- isActive: boolean
- isEmailVerified: boolean
- createdAt: timestamp
- updatedAt: timestamp
```

**Stream**
```typescript
- id: uuid
- title: string
- description: string (optional)
- privacy: enum (public, private, unlisted)
- status: enum (draft, scheduled, live, ended, cancelled)
- platform: enum[] (youtube, facebook, linkedin, twitter, twitch)
- maxParticipants: number
- streamSettings: json
- scheduledFor: timestamp (optional)
- startedAt: timestamp (optional)
- endedAt: timestamp (optional)
- viewerCount: number
- ownerId: uuid (FK)
```

**Session**
```typescript
- id: uuid
- status: enum (waiting, active, ended, kicked)
- role: enum (host, guest, producer)
- joinedAt: timestamp (optional)
- leftAt: timestamp (optional)
- isAudioEnabled: boolean
- isVideoEnabled: boolean
- isScreenSharing: boolean
- userId: uuid (FK)
- streamId: uuid (FK)
```

## 🔐 Seguridad

### Autenticación
- JWT tokens con expiración de 7 días
- Refresh tokens con expiración de 30 días
- OAuth 2.0 con Google

### Autorización
- Guards de autenticación por JWT
- Guards de roles para endpoints protegidos
- Validación de DTOs con class-validator

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 🛠️ Scripts

```bash
npm run start          # Iniciar servidor
npm run start:dev      # Modo desarrollo con hot-reload
npm run start:debug    # Modo debug
npm run build          # Compilar TypeScript
npm run lint           # Ejecutar ESLint
npm run format         # Formatear código con Prettier
```

## 📦 Dependencias Principales

- `@nestjs/common` - Framework principal
- `@nestjs/typeorm` - ORM integration
- `@nestjs/passport` - Autenticación
- `@nestjs/jwt` - JWT tokens
- `@nestjs/config` - Configuración
- `passport-google-oauth20` - Google OAuth
- `typeorm` - ORM
- `pg` - PostgreSQL driver
- `bcrypt` - Hashing de contraseñas
- `class-validator` - Validación
- `reflect-metadata` - Decorators metadata

## 🔧 Configuración

Variables de entorno requeridas en `.env`:

```env
# Application
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=streamyard
DB_PASSWORD=streamyard_password
DB_DATABASE=streamyard_db
DB_SYNCHRONIZE=true
DB_LOGGING=true

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:3000

# Stream Configuration
MAX_STREAMS_PER_USER=5
MAX_PARTICIPANTS_PER_STREAM=10
STREAM_DURATION_LIMIT_HOURS=24
```

## 🐛 Troubleshooting

### Error: Cannot connect to database
```bash
# Verificar contenedor Docker
docker ps

# Ver logs
docker-compose logs postgres

# Reiniciar
docker-compose restart
```

### Error: JWT_SECRET is not defined
Asegúrate de crear el archivo `.env` a partir de `.env.example`.

### Error: Google OAuth failing
- Verifica que GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET sean correctos
- Confirma que la URL de callback esté configurada en Google Console
- Verifica que GOOGLE_CALLBACK_URL coincida

## 📝 Arquitectura

El backend sigue una arquitectura en capas:

1. **Controllers Layer** - Maneja HTTP requests/responses
2. **Services Layer** - Lógica de negocio
3. **Repository Layer** - Acceso a datos
4. **Entities Layer** - Modelos de datos

Este patrón facilita:
- ✅ Testing de cada capa independientemente
- ✅ Reutilización de código
- ✅ Mantenimiento simplificado
- ✅ Escalabilidad

## 🚀 Próximos Pasos

Para mejorar este backend:

1. **WebRTC**: Implementar signaling server con Socket.io
2. **RTMP**: Integrar servicio de streaming real
3. **WebSocket**: Actualizaciones en tiempo real
4. **Rate Limiting**: Prevenir abuso de API
5. **Caching**: Redis para sesiones y datos frecuentes
6. **Queue**: Bull para procesamiento de tareas
7. **Monitoring**: Integrar Prometheus/Grafana
8. **Logging**: Winston para logs estructurados

## 📄 Licencia

Proyecto educativo para Taller de Aplicaciones de Internet.
