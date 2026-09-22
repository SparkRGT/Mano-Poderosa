# 🚀 Despliegue en Render - Sistema de Ventas

## Requisitos Previos

1. Cuenta en [Render](https://render.com)
2. Cuenta en [Supabase](https://supabase.com) con la base de datos configurada
3. Repositorio en GitHub/GitLab con el código

---

## 📋 Paso 1: Configurar Supabase

### 1.1 Crear proyecto en Supabase
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Crea un nuevo proyecto
3. Guarda la **URL** y la **anon key**

### 1.2 Ejecutar el esquema de base de datos
1. Ve a **SQL Editor** en Supabase
2. Ejecuta primero `backend/database/drop-all.sql` (si existe data previa)
3. Ejecuta `backend/database/schema-simple.sql`

### 1.3 Obtener credenciales
- **VITE_SUPABASE_URL**: Settings → API → Project URL
- **VITE_SUPABASE_ANON_KEY**: Settings → API → anon public key

---

## 📋 Paso 2: Preparar el Repositorio

### 2.1 Variables de entorno
Crea un archivo `.env` en la raíz (no subir a Git):

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 2.2 Asegurar que `.gitignore` incluya:
```
.env
.env.local
node_modules
dist
```

### 2.3 Subir a GitHub
```bash
git add .
git commit -m "Preparar para deploy en Render"
git push origin main
```

---

## 📋 Paso 3: Desplegar en Render

### Opción A: Web Service (Recomendado) 🌟

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en **New +** → **Web Service**
3. Conecta tu repositorio de GitHub
4. Configura:

| Campo | Valor |
|-------|-------|
| **Name** | sistema-ventas |
| **Environment** | Node |
| **Region** | Oregon (US West) o el más cercano |
| **Branch** | main |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` |

5. En **Environment Variables**, añade:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu anon key
   - `NODE_ENV` = production

6. Click en **Create Web Service**

### Opción B: Static Site (Solo Frontend)

1. **New +** → **Static Site**
2. Conecta tu repositorio
3. Configura:

| Campo | Valor |
|-------|-------|
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

4. Añade las variables de entorno igual que arriba

---

## 📋 Paso 4: Configurar Health Check (Anti-Sleep)

### En Render:
1. Ve a tu servicio
2. Settings → Health & Alerts
3. Configura:
   - **Health Check Path**: `/health`
   - **Health Check Interval**: 5 minutes

### Usar UptimeRobot (Gratuito):
1. Crea cuenta en [UptimeRobot](https://uptimerobot.com)
2. **Add New Monitor**:
   - Monitor Type: HTTP(s)
   - Friendly Name: Sistema Ventas
   - URL: `https://tu-app.onrender.com/health`
   - Monitoring Interval: 5 minutes

Esto hará ping cada 5 minutos y evitará que el servicio se duerma.

---

## 🔧 Endpoints Disponibles

| Endpoint | Descripción |
|----------|-------------|
| `/` | Aplicación principal |
| `/health` | Health check (para monitoreo) |
| `/api/info` | Información de la API |

---

## 📊 Verificar el Despliegue

### Health Check:
```bash
curl https://tu-app.onrender.com/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-02-14T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

---

## 🔐 Credenciales de Prueba

Una vez desplegado, puedes acceder con:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@tienda.com | admin123 |
| Cliente | cliente@tienda.com | cliente123 |

---

## 🐛 Troubleshooting

### Error: "Cannot find module express"
```bash
npm install express
```

### Error de CORS
Verifica que Supabase tenga tu dominio de Render en la lista permitida.

### El servicio se duerme
- Configura UptimeRobot o similar
- Verifica que el health check esté en `/health`
- En plan gratuito de Render, los servicios se duermen después de 15 min de inactividad

### Variables de entorno no funcionan
- Asegúrate de que empiecen con `VITE_` para que Vite las incluya en el build
- Redespliega después de cambiar variables

---

## 📁 Estructura del Proyecto

```
├── dist/                 # Build de producción (generado)
├── frontend/             # Aplicación React/Vite
├── backend/              # API Express
│   ├── database/         # Scripts SQL
│   └── server.js         # Servidor Express
├── docker-compose.yml    # Servicios locales
├── vite.config.ts        # Configuración de Vite
└── .env                  # Variables de entorno (no commitear)
```

---

## 🎉 ¡Listo!

Tu aplicación debería estar disponible en:
`https://tu-app.onrender.com`

Para cualquier problema, revisa los logs en el dashboard de Render.
