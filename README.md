# Trabajo Turnos — Hospital de Goya

Sistema de turnos médicos: **frontend React + Vite** y **backend Express + SQL Server**.

## Estructura

```
backend/    API REST (Express + mssql) + scripts de base de datos
frontend/   Aplicación React (Vite)
```

## Cómo levantar el proyecto

```powershell
# 1) Base de datos (una sola vez)
#    Ejecutar backend/schema_trabajo_turnos.sql en SQL Server

# 2) Backend
cd backend
npm install
npm run seed      # crea usuarios DEMO (paciente y médico) con horarios y turnos
npm run dev       # http://localhost:4000

# 3) Frontend
cd frontend
npm install
npm run dev       # http://localhost:5173
```

> En desarrollo el frontend llama a `/api/...` y Vite lo redirige al backend
> (`proxy` de `vite.config.js`), así no hay problemas de CORS.
> Para producción definí `VITE_API_URL=https://tu-backend/api` en `frontend/.env`
> y agregá el dominio del frontend a `CORS_ORIGIN` en `backend/.env`.

## Usuarios de prueba

Creados por `npm run seed` (contraseñas hasheadas con bcrypt, nunca en texto plano):

| Rol      | Email               | Contraseña    | Panel       |
| -------- | ------------------- | ------------- | ----------- |
| Paciente | `paciente@demo.com` | `Paciente123` | `/paciente` |
| Médico   | `medico@demo.com`   | `Medico123`   | `/medico`   |
| Médico   | `doctor@demo.com`   | `Doctor123`   | `/medico`   |

El paciente demo tiene turnos de ejemplo (2 pendientes y 1 atendido) con el Dr. Franco Alegre,
por lo que al iniciar sesión se ven sus turnos en el panel y también en la cartilla médica.

## API principal

| Método | Ruta                          | Descripción                           |
| ------ | ----------------------------- | ------------------------------------- |
| POST   | `/api/auth/registro`          | Registro (paciente por defecto)       |
| POST   | `/api/auth/login`             | Login, devuelve token JWT + rol       |
| GET    | `/api/medicos`                | Cartilla médica (pública)             |
| GET    | `/api/medicos/especialidades` | Especialidades disponibles            |
| POST   | `/api/turnos`                 | Crear turno (requiere token paciente) |
| GET    | `/api/turnos/paciente`        | Turnos del paciente logueado          |
| GET    | `/api/turnos/medico`          | Turnos del médico logueado            |
| PATCH  | `/api/turnos/:id/estado`      | Cambiar estado de un turno            |
