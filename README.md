# Mano Poderosa

Aplicación de ventas organizada como monorepo, sin dependencia de Supabase.

```text
mano-poderosa/
├── frontend/             # React + Vite
├── backend/              # API Express + PostgreSQL
│   └── database/         # Esquema y scripts SQL
├── docker-compose.yml    # Frontend, API y PostgreSQL
└── .env.example          # Configuración local de la base de datos
```

## Inicio rápido

1. Copia `.env.example` a `.env` y define una contraseña segura.
2. Ejecuta `docker compose up --build`.
3. Abre `http://localhost:5173`.

Servicios locales:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000` (`/health` comprueba la API y PostgreSQL)
- PostgreSQL: accesible solamente dentro de Docker como `db:5432`

Los datos se guardan en el volumen `postgres_data`. Para reinicializar la base de desarrollo, ejecuta `docker compose down -v` antes de levantarla otra vez.

## Desarrollo sin Docker

En dos terminales distintas:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

El frontend redirige automáticamente las solicitudes `/api` al backend local.
