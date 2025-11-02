# TODO: Organizar y corregir app-clima para GitHub y Render

## Backend
- [x] Corregir backend/index.js: Reemplazar contenido con servidor Express correcto.
- [x] Actualizar backend/controllers/WeatherController.js: Formatear respuesta para clima actual.
- [x] Agregar endpoint para pronóstico en WeatherController.js.
- [x] Corregir import en backend/routes/weather.js (case sensitivity).
- [x] Eliminar archivos vacíos: backend/models/clientes.models.js, backend/database.js.
- [x] Agregar .env para OPENWEATHER_KEY.
- [x] Actualizar .gitignore para incluir .env y node_modules.

## Frontend
- [x] Corregir frontend/package.json: Cambiar "boostrap" a "bootstrap".
- [x] Eliminar frontend/src/index.html (no usado en React).
- [x] Verificar que frontend/src/App.js esté correcto.

## Deployment
- [x] Actualizar backend/render.yaml para incluir build del frontend.
- [x] Probar localmente: npm run dev en backend, npm start en frontend.

## General
- [ ] Asegurar que APIs funcionen correctamente.
- [ ] Preparar para push a GitHub.
