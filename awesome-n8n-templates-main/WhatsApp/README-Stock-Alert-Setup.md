# 📱 Guía de Configuración: Stock Alert WhatsApp Notification

Esta guía te ayudará a configurar todas las credenciales necesarias para el workflow de alertas de stock bajo por WhatsApp.

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Supabase](#1-configuración-de-supabase)
3. [Configuración de WhatsApp Business API](#2-configuración-de-whatsapp-business-api)
4. [Configuración en n8n](#3-configuración-en-n8n)
5. [Pruebas y Verificación](#4-pruebas-y-verificación)
6. [Solución de Problemas](#5-solución-de-problemas)

---

## Requisitos Previos

- ✅ Cuenta de [Supabase](https://supabase.com) con proyecto activo
- ✅ Cuenta de [Meta Business](https://business.facebook.com) (Facebook Business)
- ✅ n8n instalado (self-hosted o [n8n Cloud](https://n8n.io))
- ✅ Número de teléfono para WhatsApp Business (puede ser diferente al personal)

---

## 1. Configuración de Supabase

### 1.1 Obtener URL del Proyecto

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** (⚙️) → **API**
4. Copia la **Project URL**
   ```
   Ejemplo: https://abcdefghijk.supabase.co
   ```

### 1.2 Obtener Service Role Key

> ⚠️ **IMPORTANTE**: La Service Role Key tiene acceso completo a tu base de datos. Nunca la expongas públicamente.

1. En el mismo panel **Settings** → **API**
2. Busca la sección **Project API keys**
3. Copia la **service_role** key (NO la anon key)
   ```
   Ejemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJz...
   ```

### 1.3 Verificar Tabla Settings

Asegúrate de que tu tabla `settings` tenga estos campos:

```sql
-- Verificar que existan los campos necesarios
SELECT admin_whatsapp, min_stock_alert FROM settings LIMIT 1;
```

Si no existen, créalos:

```sql
-- Agregar columnas si no existen
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS admin_whatsapp VARCHAR(20),
ADD COLUMN IF NOT EXISTS min_stock_alert INTEGER DEFAULT 5;

-- Actualizar con tus valores
UPDATE settings SET 
  admin_whatsapp = '+1234567890',  -- Tu número con código de país
  min_stock_alert = 5              -- Stock mínimo para alertar
WHERE id = 1;
```

### 1.4 Formato del Número de WhatsApp

El número debe incluir:
- Código de país (sin el +)
- Sin espacios ni guiones

| ❌ Incorrecto | ✅ Correcto |
|---------------|-------------|
| 809-555-1234 | 18095551234 |
| +1 809 555 1234 | 18095551234 |
| (809) 555-1234 | 18095551234 |

---

## 2. Configuración de WhatsApp Business API

### 2.1 Crear Cuenta de Meta Business

1. Ve a [Meta Business Suite](https://business.facebook.com)
2. Crea una cuenta de negocio si no tienes
3. Verifica tu negocio (puede tomar 1-3 días)

### 2.2 Crear App en Meta Developers

1. Ve a [Meta for Developers](https://developers.facebook.com)
2. Click en **My Apps** → **Create App**
3. Selecciona **Business** como tipo de app
4. Completa los datos:
   - **App Name**: Stock Alert System (o el nombre que prefieras)
   - **App Contact Email**: tu email
   - **Business Account**: selecciona tu cuenta de negocio

### 2.3 Agregar WhatsApp a la App

1. En el Dashboard de tu app, busca **Add Products**
2. Encuentra **WhatsApp** y click en **Set Up**
3. Acepta los términos de servicio

### 2.4 Obtener Access Token Permanente

#### Opción A: Token Temporal (para pruebas - expira en 24h)

1. Ve a **WhatsApp** → **API Setup** en tu app
2. Copia el **Temporary access token**

#### Opción B: Token Permanente (recomendado para producción)

1. Ve a **Business Settings** → **Users** → **System Users**
2. Click en **Add** para crear un System User:
   - **Name**: n8n-whatsapp-bot
   - **Role**: Admin
3. Click en **Add Assets**:
   - Selecciona **Apps** → tu app de WhatsApp
   - Otorga **Full Control**
4. Click en **Generate New Token**:
   - Selecciona tu app
   - Selecciona estos permisos:
     - `whatsapp_business_management`
     - `whatsapp_business_messaging`
   - Token Expiration: **Never**
5. Copia y guarda el token de forma segura

```
Ejemplo de token:
EAAGm0PXZBZBZABOZCZCqHZCdVw3e...muy largo...ZDZBaQZDZD
```

### 2.5 Obtener Phone Number ID

1. Ve a **WhatsApp** → **API Setup**
2. En la sección **Send and receive messages**
3. Busca **Phone number ID** debajo de tu número
   ```
   Ejemplo: 123456789012345
   ```

### 2.6 Obtener WhatsApp Business Account ID

1. En **WhatsApp** → **API Setup**
2. Busca **WhatsApp Business Account ID**
   ```
   Ejemplo: 109876543210987
   ```

### 2.7 Agregar Número de Teléfono de Prueba

Para modo sandbox/desarrollo:

1. Ve a **WhatsApp** → **API Setup**
2. En **To** field, click en **Manage phone number list**
3. Agrega los números que recibirán mensajes de prueba
4. Cada número debe verificarse con un código SMS

> 📝 **Nota**: En modo sandbox solo puedes enviar a números verificados. Para producción, necesitas verificar tu negocio con Meta.

---

## 3. Configuración en n8n

### 3.1 Importar el Workflow

1. Abre n8n
2. Ve a **Workflows** → **Import from File**
3. Selecciona `Stock Alert WhatsApp Notification.json`

### 3.2 Crear Credencial de Supabase

1. Ve a **Credentials** → **Add Credential**
2. Busca **Supabase API**
3. Completa los campos:

| Campo | Valor |
|-------|-------|
| **Host** | `https://tu-proyecto.supabase.co` |
| **Service Role Secret** | Tu service_role key |

4. Click en **Save**

### 3.3 Crear Credencial de WhatsApp

1. Ve a **Credentials** → **Add Credential**
2. Busca **WhatsApp Business Cloud API**
3. Completa los campos:

| Campo | Valor |
|-------|-------|
| **Access Token** | Tu token permanente de Meta |
| **Business Account ID** | Tu WhatsApp Business Account ID |

4. Click en **Save**

### 3.4 Configurar Nodos del Workflow

#### Nodo: Get Low Stock Products
1. Click en el nodo
2. En **Credential to connect with**, selecciona tu credencial de Supabase

#### Nodo: Get Admin WhatsApp
1. Click en el nodo
2. Selecciona tu credencial de Supabase

#### Nodo: Send WhatsApp Alert
1. Click en el nodo
2. Selecciona tu credencial de WhatsApp
3. En **Phone Number ID**, ingresa tu Phone Number ID:
   ```
   123456789012345
   ```

### 3.5 Ajustar Frecuencia de Ejecución

Por defecto, el workflow se ejecuta cada hora. Para cambiar:

1. Click en el nodo **Check Stock Every Hour**
2. Ajusta el intervalo según necesites:
   - Cada 30 minutos
   - Cada 2 horas
   - Una vez al día (8:00 AM)

---

## 4. Pruebas y Verificación

### 4.1 Probar Manualmente

1. Asegúrate de tener al menos un producto con stock bajo
2. Click en **Test Workflow** en n8n
3. Verifica cada nodo:
   - ✅ Get Low Stock Products: debe retornar productos
   - ✅ Has Low Stock Products?: debe ir por rama TRUE
   - ✅ Send WhatsApp Alert: debe mostrar éxito

### 4.2 Verificar Mensaje Recibido

Deberías recibir un mensaje como este:

```
🚨 ALERTA DE STOCK BAJO 🚨

📅 Fecha: 18/02/2026
⏰ Hora: 14:30:00

Se encontraron 3 productos con stock bajo:

1. Coca Cola 2L
   📦 Stock actual: 2
   📁 Categoría: Bebidas
   ⚠️ Mínimo requerido: 5
...
```

### 4.3 Activar el Workflow

Una vez probado:
1. Click en **Inactive** toggle para activarlo
2. El workflow ahora se ejecutará automáticamente

---

## 5. Solución de Problemas

### Error: "Invalid OAuth access token"

**Causa**: Token expirado o incorrecto

**Solución**:
1. Genera un nuevo token permanente
2. Actualiza la credencial en n8n

### Error: "Phone number not in allowed list"

**Causa**: Número no verificado en sandbox

**Solución**:
1. Ve a Meta Developers → WhatsApp → API Setup
2. Agrega el número a la lista de pruebas
3. Verifica con código SMS

### Error: "Message template not found"

**Causa**: Estás intentando enviar mensaje a número no verificado

**Solución**:
- En sandbox: verifica el número receptor
- En producción: solicita aprobación de tu cuenta de negocio

### Error: "Could not find credential"

**Causa**: Credencial no configurada en el nodo

**Solución**:
1. Click en cada nodo de Supabase/WhatsApp
2. Selecciona la credencial correspondiente

### No se envían mensajes pero no hay error

**Posibles causas**:
1. No hay productos con stock bajo
2. El campo `admin_whatsapp` está vacío
3. El número tiene formato incorrecto

**Verificar**:
```sql
SELECT * FROM products WHERE stock <= (SELECT min_stock_alert FROM settings LIMIT 1);
SELECT admin_whatsapp FROM settings;
```

---

## 📚 Recursos Adicionales

- [Documentación WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Documentación n8n WhatsApp](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.whatsapp/)
- [Documentación Supabase](https://supabase.com/docs)
- [Guía de Verificación de Negocio Meta](https://www.facebook.com/business/help/2058515294227817)

---

## 🔐 Resumen de Credenciales Necesarias

| Servicio | Credencial | Dónde Obtener |
|----------|------------|---------------|
| Supabase | Project URL | Dashboard → Settings → API |
| Supabase | Service Role Key | Dashboard → Settings → API |
| WhatsApp | Access Token | Meta Developers → System User |
| WhatsApp | Business Account ID | WhatsApp → API Setup |
| WhatsApp | Phone Number ID | WhatsApp → API Setup |

---

## ✅ Checklist Final

- [ ] Proyecto de Supabase configurado
- [ ] Tabla settings con `admin_whatsapp` y `min_stock_alert`
- [ ] App creada en Meta Developers
- [ ] WhatsApp agregado a la app
- [ ] Token permanente generado
- [ ] Phone Number ID obtenido
- [ ] Credenciales creadas en n8n
- [ ] Workflow importado y configurado
- [ ] Prueba manual exitosa
- [ ] Workflow activado

---

💡 **Tip**: Guarda todas tus credenciales en un lugar seguro como un gestor de contraseñas. Nunca las compartas en repositorios públicos.
