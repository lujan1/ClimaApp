// ============================
// IMPORTS Y CONFIGURACIÓN
// ============================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db.js";

import weatherRoutes from "./routes/weather.js";
import forecastRoutes from "./routes/forecast.js";
import userRoutes from "./routes/userRoutes.js"; // 👈 Nombre corregido (en minúsculas)

// Cargar variables de entorno
dotenv.config();

// Inicializar app y conexión MongoDB
const app = express();
connectDB();

const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================
// MIDDLEWARES
// ============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ============================
// RUTAS API
// ============================

// Rutas de usuarios (registro, login, etc.)
app.use("/api/users", userRoutes);
console.log("✅ Rutas de usuario cargadas en /api/users");

// Rutas de clima
app.use("/clima", weatherRoutes);
app.use("/pronostico", forecastRoutes);

// Ruta raíz API
app.get("/api", (req, res) => {
  res.json({ message: "🌦️ API del Clima funcionando correctamente" });
});

// ============================
// FRONTEND REACT (BUILD)
// ============================

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Si no es una ruta API, devolver index.html del frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"), (err) => {
    if (err) {
      res.status(500).send("Error cargando el frontend");
    }
  });
});

// ============================
// INICIAR SERVIDOR
// ============================
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
