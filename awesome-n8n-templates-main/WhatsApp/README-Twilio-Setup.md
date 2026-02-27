# 📱 Guía de Configuración: Stock Alert con Twilio WhatsApp

Guía paso a paso para configurar alertas de stock bajo por WhatsApp usando **Twilio**.

---

## 📋 Índice

1. [¿Por qué Twilio?](#por-qué-twilio)
2. [Crear Cuenta en Twilio](#1-crear-cuenta-en-twilio)
3. [Activar WhatsApp Sandbox](#2-activar-whatsapp-sandbox)
4. [Obtener Credenciales](#3-obtener-credenciales)
5. [Configurar Supabase](#4-configurar-supabase)
6. [Configurar n8n](#5-configurar-n8n)
7. [Probar el Workflow](#6-probar-el-workflow)
8. [Producción (Opcional)](#7-producción-opcional)

---

## ¿Por qué Twilio?

| Característica | Meta WhatsApp API | Twilio |
|----------------|-------------------|--------|
| Configuración | Compleja | Fácil |
| Tiempo de setup | 1-3 días | 10 minutos |
| Verificación de negocio | Requerida | No para sandbox |
| Costo | Gratis (con límites) | ~$0.005/mensaje |
| Sandbox para pruebas | No | Sí ✅ |

**Twilio es ideal para**:
- Pruebas rápidas
- Proyectos pequeños/medianos
- Cuando no quieres esperar verificación de Meta

---

## 1. Crear Cuenta en Twilio

### 1.1 Registro

1. Ve a [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Completa el formulario:
   - Email
   - Nombre
   - Contraseña
   - Número de teléfono (para verificación)

3. Verifica tu email
4. Verifica tu número de teléfono (recibirás SMS)

### 1.2 Crédito Gratis

Al crear tu cuenta recibes **~$15 USD de crédito gratis**. Esto alcanza para:
- ~3,000 mensajes WhatsApp (sandbox)
- ~2,000 mensajes SMS

---

## 2. Activar WhatsApp Sandbox

### 2.1 Acceder al Sandbox

1. Ve a [Twilio Console](https://console.twilio.com)
2. En el menú izquierdo: **Messaging** → **Try it out** → **Send a WhatsApp message**

![Twilio Menu](https://i.imgur.com/example.png)

### 2.2 Unirte al Sandbox

Verás instrucciones como estas:

```
Send a WhatsApp message to +1 415 523 8886
with code: join example-word
```

**Pasos**:
1. Abre WhatsApp en tu teléfono
2. Agrega el número `+1 415 523 8886` a tus contactos
3. Envía el mensaje: `join example-word` (usa TU código, no este ejemplo)
4. Recibirás confirmación: "You are all set!"

### 2.3 Agregar Más Números

Cada persona que quiera recibir alertas debe:
1. Enviar el mismo mensaje `join <codigo>` al número de Twilio
2. Solo números unidos pueden recibir mensajes del sandbox

---

## 3. Obtener Credenciales

### 3.1 Account SID y Auth Token

1. Ve a [Twilio Console Dashboard](https://console.twilio.com)
2. En la sección **Account Info** verás:

```
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token:  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (click "Show" para ver)
```

3. Copia ambos valores

### 3.2 Número de WhatsApp Sandbox

El número del sandbox es siempre:
```
whatsapp:+14155238886
```

> ⚠️ Este número es compartido. En producción tendrás tu propio número.

---

## 4. Configurar Supabase

### 4.1 Verificar Tabla Settings

```sql
-- Verificar campos necesarios
SELECT admin_whatsapp, min_stock_alert FROM settings;
```

### 4.2 Actualizar Número de Admin

```sql
UPDATE settings SET 
  admin_whatsapp = '+18095551234',  -- Tu número con código de país
  min_stock_alert = 5
WHERE id = 1;
```

**Formato del número**:
- Incluir código de país con `+`
- Sin espacios ni guiones
- Ejemplo: `+18095551234` (República Dominicana)

### 4.3 Obtener Credenciales de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. **Settings** → **API**
4. Copia:
   - **Project URL**: `https://xxx.supabase.co`
   - **service_role key**: `eyJhbGci...`

---

## 5. Configurar n8n

### 5.1 Importar Workflow

1. Descarga `Stock Alert WhatsApp - Twilio.json`
2. En n8n: **Workflows** → **Import from File**
3. Selecciona el archivo

### 5.2 Crear Credencial de Supabase

1. **Credentials** → **Add Credential** → **Supabase API**
2. Completa:

| Campo | Valor |
|-------|-------|
| Host | `https://tu-proyecto.supabase.co` |
| Service Role Secret | Tu service_role key |

3. **Save**

### 5.3 Crear Credencial de Twilio

1. **Credentials** → **Add Credential** → **Twilio API**
2. Completa:

| Campo | Valor |
|-------|-------|
| Account SID | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| Auth Token | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |

3. **Save**

### 5.4 Configurar Nodos

#### Nodos de Supabase
1. Click en **Get Low Stock Products**
2. Selecciona tu credencial de Supabase
3. Repite para **Get Admin WhatsApp**

#### Nodo de Twilio
1. Click en **Send WhatsApp via Twilio**
2. Selecciona tu credencial de Twilio
3. En el campo **From**, ingresa:
   ```
   whatsapp:+14155238886
   ```

---

## 6. Probar el Workflow

### 6.1 Crear Producto de Prueba con Stock Bajo

```sql
-- Insertar producto con stock bajo para probar
INSERT INTO products (name, stock, price, category_id, active)
VALUES ('Producto Prueba', 1, 100, 1, true);
```

### 6.2 Ejecutar Test

1. En n8n, click en **Test Workflow**
2. Verifica cada nodo:
   - ✅ **Get Low Stock Products**: Debe retornar productos
   - ✅ **Has Low Stock?**: Debe ir por rama TRUE
   - ✅ **Format Message**: Debe generar el texto
   - ✅ **Send WhatsApp**: Debe mostrar éxito

### 6.3 Verificar Mensaje

Deberías recibir en WhatsApp:

```
🚨 *ALERTA DE STOCK BAJO* 🚨

📅 Fecha: 18/02/2026
⏰ Hora: 14:30:00

Se encontraron *1* productos con stock bajo:

1. *Producto Prueba*
   📦 Stock: 1
   📁 Categoría: General
   ⚠️ Mínimo: 5

_Reponer inventario pronto._
```

### 6.4 Activar Workflow

1. Toggle **Inactive** → **Active**
2. El workflow ahora se ejecutará cada hora automáticamente

---

## 7. Producción (Opcional)

### 7.1 Solicitar Número Propio

Para producción necesitas un número de WhatsApp Business:

1. Ve a **Messaging** → **Senders** → **WhatsApp senders**
2. Click en **Add new sender**
3. Completa el formulario:
   - Nombre del negocio
   - Dirección
   - Descripción
4. Espera aprobación de Meta (~1-2 semanas)

### 7.2 Actualizar Workflow

Cuando tengas tu número:

1. Edita el nodo **Send WhatsApp via Twilio**
2. Cambia **From** de `whatsapp:+14155238886` a tu número:
   ```
   whatsapp:+1TUNUMERO
   ```

### 7.3 Templates de Mensaje

En producción, WhatsApp requiere templates aprobados para mensajes iniciados por el negocio.

1. Ve a **Messaging** → **Content Template Builder**
2. Crea un template para alertas de stock
3. Espera aprobación
4. Usa el template en tu workflow

---

## 🔧 Solución de Problemas

### "Could not find credential"
- Verifica que la credencial esté creada en n8n
- Selecciona la credencial en cada nodo

### "Number not in sandbox"
- El número receptor debe enviar `join <codigo>` al sandbox primero
- Verifica que usaste el código correcto

### "Invalid From number"
- Asegúrate de usar `whatsapp:+14155238886` exactamente
- No cambies el número del sandbox

### "Message body is required"
- Verifica que el nodo **Format Message** genera texto
- Revisa que hay productos con stock bajo

### No recibo mensajes pero no hay error
1. Verifica que te uniste al sandbox
2. Verifica el número en `admin_whatsapp`
3. Ejecuta manualmente y revisa cada nodo

---

## 📊 Resumen de Credenciales

| Servicio | Dato | Ejemplo |
|----------|------|---------|
| Twilio | Account SID | `ACxx...xx` |
| Twilio | Auth Token | `xxxxx...` |
| Twilio | WhatsApp Number | `whatsapp:+14155238886` |
| Supabase | Project URL | `https://xxx.supabase.co` |
| Supabase | Service Role Key | `eyJhbG...` |

---

## ✅ Checklist

- [ ] Cuenta de Twilio creada
- [ ] Sandbox de WhatsApp activado
- [ ] Número unido al sandbox (envié `join <codigo>`)
- [ ] Credenciales de Twilio obtenidas
- [ ] Credenciales de Supabase obtenidas
- [ ] `admin_whatsapp` configurado en settings
- [ ] Workflow importado en n8n
- [ ] Credenciales asignadas a todos los nodos
- [ ] Test manual exitoso
- [ ] Workflow activado

---

## 💡 Tips

1. **Prueba primero**: Siempre prueba con el sandbox antes de pagar por producción
2. **Múltiples números**: Puedes agregar más números al sandbox para probar
3. **SMS alternativo**: Si WhatsApp no funciona, Twilio también puede enviar SMS cambiando el formato del número
4. **Logs**: Revisa los logs en Twilio Console para debugging

---

## 📚 Enlaces Útiles

- [Twilio Console](https://console.twilio.com)
- [Twilio WhatsApp Docs](https://www.twilio.com/docs/whatsapp)
- [n8n Twilio Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.twilio/)
- [Twilio WhatsApp Pricing](https://www.twilio.com/whatsapp/pricing)
