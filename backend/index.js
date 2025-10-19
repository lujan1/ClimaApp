import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000; // Render asignará process.env.PORT
const API_KEY = process.env.OPENWEATHER_KEY;

// ⚡ Habilitar CORS solo si se necesita
app.use(cors({ origin: "*" }));

// ----------- RUTAS API -----------

// Clima actual
app.get("/clima/:city", async (req, res) => {
  try {
    const city = req.params.city;
    const lang = req.query.lang || "es";

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=${lang}`
    );
    const data = await response.json();

    if (data.cod !== 200) {
      return res.status(404).json({ error: data.message || "Ciudad no encontrada" });
    }

    res.json({
      ciudad: data.name,
      pais: data.sys.country,
      temperatura: data.main.temp,
      clima: data.weather[0].description,
      icono: data.weather[0].icon,
      viento: data.wind.speed,
      humedad: data.main.humidity,
      presion: data.main.pressure,
      lat: data.coord.lat,
      lon: data.coord.lon,
      timezone: data.timezone,
      id: data.id,
    });
  } catch (error) {
    console.error("Error clima:", error);
    res.status(500).json({ error: "Error al obtener el clima" });
  }
});

// Pronóstico extendido (24h)
app.get("/pronostico/:city", async (req, res) => {
  try {
    const city = req.params.city;
    const lang = req.query.lang || "es";

    // Obtener coordenadas
    const cityData = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=${lang}`
    ).then(r => r.json());

    if (cityData.cod !== 200) {
      return res.status(404).json({ error: "Ciudad no encontrada" });
    }

    const { lat, lon } = cityData.coord;

    const forecastData = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${lang}`
    ).then(r => r.json());

    const hourly = forecastData.list.map(item => ({
      fecha: item.dt_txt,
      temperatura: item.main.temp,
      descripcion: item.weather[0].description,
      icono: item.weather[0].icon,
    }));

    res.json(hourly);
  } catch (error) {
    console.error("Error pronóstico:", error);
    res.status(500).json({ error: "Error al obtener pronóstico" });
  }
});

// ----------- SERVIR FRONTEND REACT -----------
// Asegúrate de hacer `npm run build` en frontend antes
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Cualquier otra ruta devuelve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// ----------- INICIAR SERVIDOR -----------
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
