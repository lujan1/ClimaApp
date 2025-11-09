import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db.js";
import userRoutes from "./routes/UserRoutes.js";
import weatherRoutes from "./routes/weather.js";
import forecastRoutes from "./routes/forecast.js";

dotenv.config();

const app = express();
connectDB();

const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 🔥 ESTA LÍNEA DEBE EXISTIR Y ESTAR ANTES DEL FRONTEND
app.use("/api/users", userRoutes);

app.use("/clima", weatherRoutes);
app.use("/pronostico", forecastRoutes);

// Ruta raíz API
app.get("/api", (req, res) => {
  res.json({ message: "🌦️ API del Clima funcionando correctamente" });
});

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
