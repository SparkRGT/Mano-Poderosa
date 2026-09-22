# Prompt para Android Studio AI

Quiero que desarrolles la versión Android de este proyecto por partes, sin saltarte etapas y manteniendo la arquitectura ordenada.

## Contexto del proyecto

Este proyecto web es un sistema de ventas con dos roles principales:

- `admin`: administra productos, categorías, ventas, facturas, clientes, deudas, solicitudes de pago, reportes y configuración.
- `customer`: consulta catálogo, compras, facturas, deuda y solicitudes de pago.

El frontend actual está hecho con React + TypeScript + Vite, pero la app Android debe reconstruirse de forma nativa en Kotlin usando Jetpack Compose.

La lógica de negocio está basada en estas entidades principales:

- Usuarios con roles.
- Categorías.
- Productos con stock, precio, código y estado activo.
- Ventas con items.
- Facturas generadas automáticamente.
- Deudas ligadas a ventas o deudas externas.
- Solicitudes de pago con estados `pending`, `approved`, `rejected`.
- Configuración del sistema.

La base de datos ya existe y el esquema simplificado está definido en SQL. La app Android debe respetar ese modelo y no inventar otros campos sin necesidad.

## Reglas importantes

1. Trabaja por fases, una por una.
2. No generes todo el proyecto de golpe.
3. Antes de cada fase, resume qué vas a construir y qué archivos crearás o modificarás.
4. Si una fase depende de otra, dilo explícitamente.
5. Si detectas un vacío funcional, propón la solución mínima compatible con el sistema actual.
6. Mantén una UI moderna, clara y pensada para móvil.
7. Usa buenas prácticas de Android actual: Kotlin, Jetpack Compose, arquitectura por capas, ViewModel, StateFlow o LiveData según convenga, navegación clara y separación de responsabilidades.
8. Si necesitas backend o API, reutiliza el modelo existente en lugar de redefinirlo.
9. No avances a la siguiente fase hasta que la anterior esté completa y validada.

## Arquitectura que debe seguir la app Android

Quiero una estructura limpia con estas capas:

- `data`: API, repositorios, DTOs y mapeos.
- `domain`: modelos de negocio y casos de uso si hace falta.
- `ui`: pantallas, componentes, navegación y estado de UI.
- `navigation`: rutas y grafo de navegación.
- `di`: inyección de dependencias si la usas.

Si consideras mejor otra arquitectura, propón una sola alternativa y justifícala brevemente, pero no compliques el proyecto innecesariamente.

## Módulos funcionales del sistema

### Público

- Login.
- Registro.
- Manejo de sesión.

### Admin

- Dashboard con métricas.
- Información de la tienda.
- Productos.
- Categorías.
- Ventas.
- Nueva venta.
- Facturas.
- Clientes.
- Deudas.
- Solicitudes de pago.
- Reportes.
- Configuración.

### Cliente

- Catálogo de productos.
- Mis compras.
- Mis facturas.
- Mi deuda.
- Mis abonos o solicitudes de pago.

## Modelo de datos que debes respetar

- `users`: id, email, password, name, phone, role.
- `categories`: id, name.
- `products`: id, product_code, name, price, stock, category_id, is_active.
- `sales`: id, customer_id, total, status, notes, created_at, created_by.
- `sale_items`: id, sale_id, product_id, product_name, product_code, quantity, unit_price, subtotal.
- `invoices`: id, invoice_number, sale_id, customer_id, customer_email, customer_name, total, created_at.
- `debts`: id, customer_id, concept, amount, remaining, sale_id, type, created_at, created_by.
- `payment_requests`: id, customer_id, amount, status, notes, admin_notes, resolved_by, created_at, resolved_at.
- `settings`: id, key, value, description, updated_at.

Estados importantes:

- Venta: `paid`, `pending`.
- Deuda: `sale`, `external`.
- Solicitud de pago: `pending`, `approved`, `rejected`.

## Plan de desarrollo por fases

### Fase 1: base del proyecto

Crear la estructura inicial del proyecto Android con:

- configuración base,
- navegación,
- tema visual,
- manejo de sesión,
- capa de datos preparada para consumir el backend,
- modelos iniciales.

### Fase 2: autenticación

Implementar:

- login,
- registro,
- cierre de sesión,
- persistencia de sesión,
- redirección según rol.

### Fase 3: shell de navegación

Implementar dos flujos separados:

- shell de admin,
- shell de cliente.

En móvil, la navegación debe ser simple y cómoda: bottom bar, drawer o navegación híbrida si conviene.

### Fase 4: catálogo y productos

Implementar:

- listado de productos,
- detalle de producto,
- búsqueda y filtros,
- categorías,
- stock y estado activo.

### Fase 5: ventas

Implementar:

- creación de venta,
- carrito,
- cálculo de totales,
- items de venta,
- venta pagada o pendiente.

### Fase 6: facturas, deudas y solicitudes

Implementar:

- listado de facturas,
- detalle de factura,
- deudas del cliente,
- solicitudes de pago,
- estados y resolución.

### Fase 7: administración

Implementar:

- dashboard,
- clientes,
- reportes,
- configuración,
- información de la tienda.

### Fase 8: refinamiento final

Hacer:

- manejo de errores,
- estados de carga,
- validaciones,
- mensajes vacíos,
- diseño responsive móvil,
- pulido visual,
- optimización de arquitectura.

## Cómo quiero que entregues cada fase

Para cada fase, entrégame siempre este formato:

1. Objetivo de la fase.
2. Archivos nuevos o modificados.
3. Código completo de lo necesario.
4. Explicación breve de cómo probarlo.
5. Siguiente fase recomendada.

## Instrucción final

Empieza por la Fase 1 y no continúes a la siguiente hasta que te lo pida o hasta que la fase actual quede completada con código listo.